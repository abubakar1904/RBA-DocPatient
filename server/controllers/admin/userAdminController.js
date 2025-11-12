import User from "../../models/user.js";

export const listUsers = async (req, res) => {
  try {
    const { role, query } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }
    const users = await User.find(filter).select("name email role active approved verified profileCompleted").sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load users" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, active, approved } = req.body || {};
    const update = {};
    if (role !== undefined) update.role = role;
    if (active !== undefined) update.active = active;
    if (approved !== undefined) update.approved = approved;
    const user = await User.findByIdAndUpdate(id, update, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update user" });
  }
};

export const listDoctors = async (req, res) => {
  try {
    const { status } = req.query; // pending | approved | active
    const filter = { role: "doctor" };
    if (status === "pending") filter.approved = false;
    if (status === "approved") filter.approved = true;
    const doctors = await User.find(filter).select("name email approved active profileCompleted doctorDetails").sort({ createdAt: -1 });
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load doctors" });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, active } = req.body || {};
    const update = {};
    if (approved !== undefined) update.approved = approved;
    if (active !== undefined) update.active = active;
    const user = await User.findOneAndUpdate({ _id: id, role: "doctor" }, update, { new: true });
    if (!user) return res.status(404).json({ message: "Doctor not found" });
    res.json({ doctor: user });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update doctor" });
  }
};

export const getDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await User.findOne({ _id: id, role: "doctor" }).select(
      "name email active approved verified profileCompleted avatarUrl phone bio doctorDetails"
    );
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load doctor" });
  }
};


