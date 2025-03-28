import { getProxyUrl, PFP_BUCKET_NAME, uploadToR2, deleteFromR2, extractKeyFromProxyUrl } from "@/lib/cloudflare";
import { generateToken } from "@/lib/jwt";
import { authMiddleware, refreshTokenMiddleware } from "@/lib/middleware";
import User from "@/models/user";
import bcrypt from "bcryptjs";
import { Request, RequestHandler, Response, Router } from "express";
import { Error } from "mongoose";
import multer from "multer";
import crypto from "crypto";

const router = Router();

router.post("/register", async (req: Request, res: Response) => {
  const { email, password, name, username } = req.body;

  if (!email || !password || !name || !username) {
    return res
      .status(400)
      .json({ error: "Email, password, name, and username are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      username,
    });
    await newUser.save();

    const token = generateToken({
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      username: newUser.username,
    });

    res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Server error. Please try again later." });
      console.log(error);
    }
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const token = generateToken({
      _id: user._id,
      email: user.email,
      name: user.name,
      username: user.username,
      pfp: user.pfp,
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

router.get("/checkAuth", authMiddleware, (req: Request, res: Response) => {
  const user = req.auth;
  res.status(200).json({ message: "Authorized access", user });
});

router.get("/user", authMiddleware, async (req: Request, res: Response) => {
  const user = req.auth;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  res.status(200).json(user);
});

router.get("/details", authMiddleware, async (req: Request, res: Response) => {
  const user = req.auth;

  if (!user) {
    return res.status(401).json({ error: "Unauthorized access" });
  }

  const userId = user._id;

  try {
    const userQuery = await User.findById(userId).populate("songs");

    if (!userQuery) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(userQuery);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      cb(new Error("Invalid file type"));
      return;
    }
    cb(null, true);
  },
});

router.put(
  "/update",
  authMiddleware,
  upload.single("pfp") as unknown as RequestHandler,
  async (req: Request, res: Response) => {
    const user = req.auth;
    let pfpUrl: string | null = null;
    if (!user) {
      return res.status(401).json({ error: "Unauthorized access" });
    }

    try {
      const userId = user._id;
      const updates: any = {};

      const allowedFields = ["username", "email", "name", "bio"];
      allowedFields.forEach((field) => {
        if (req.body[field]) {
          updates[field] = req.body[field];
        }
      });

      if (req.body.password) {
        updates.password = await bcrypt.hash(req.body.password, 10);
      }

      if (req.file) {
        // If the user already has a profile pic, delete it first
        const currentUser = await User.findById(userId);
        if (currentUser && currentUser.pfp) {
          try {
            // Extract the key from the URL
            const key = extractKeyFromProxyUrl(currentUser.pfp);

            if (key) {
              // Delete the old profile pic
              await deleteFromR2({
                key,
                bucket: PFP_BUCKET_NAME
              });
              console.log(`Successfully deleted old profile picture: ${key}`);
            }
          } catch (error) {
            console.error("Failed to delete old profile picture:", error);
            // Continue with upload even if delete fails
          }
        }

        const fileExtension = req.file.originalname.split(".").pop();
        const key = `pfp/${userId}/${crypto.randomUUID()}.${fileExtension}`;

        // Use the new uploadToR2 function that handles local development
        const result = await uploadToR2({
          file: req.file.buffer,
          key,
          bucket: PFP_BUCKET_NAME,
          contentType: req.file.mimetype
        });

        if (!result.success) {
          throw new Error("Failed to upload profile picture");
        }

        updates.pfp = key;

        pfpUrl = getProxyUrl({
          key,
          bucket: PFP_BUCKET_NAME,
        });

        if (!pfpUrl) {
          throw new Error("Failed to create profile picture proxy URL");
        }

        updates.pfp = pfpUrl;
      }

      if (updates.email) {
        const existingUser = await User.findOne({
          email: updates.email,
          _id: { $ne: userId },
        });
        if (existingUser) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      if (updates.username) {
        const existingUser = await User.findOne({
          username: updates.username,
          _id: { $ne: userId },
        });
        if (existingUser) {
          return res.status(400).json({ error: "Username already taken" });
        }
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate("songs");

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      await updatedUser.save();

      const newToken = await refreshTokenMiddleware(req, res);

      res.status(200).json({ updatedUser, newToken });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
