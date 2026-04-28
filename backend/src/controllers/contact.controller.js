import ContactMessage from "../models/contact.model.js";

// POST /api/contact/submit
export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const newMessage = await ContactMessage.create({ name, email, phone, message });

    return res.status(201).json({
      success: true,
      message: "Message submitted successfully",
      data: newMessage,
    });
  } catch (err) {
    console.error("Contact Submit Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/contact (ADMIN)
export const getAllContactMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (err) {
    console.error("Fetch Contact Messages Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/contact/:id (ADMIN)
export const deleteContactMessage = async (req, res) => {
  try {
    const id = req.params.id;

    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    await message.deleteOne();

    return res.status(200).json({ success: true, message: "Message deleted" });
  } catch (err) {
    console.error("Delete Message Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /api/contact/:id/reply (ADMIN)
export const markMessageReplied = async (req, res) => {
  try {
    const id = req.params.id;
    const message = await ContactMessage.findById(id);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    message.replied = true;
    await message.save();

    return res
      .status(200)
      .json({ success: true, message: "Marked as replied", data: message });
  } catch (err) {
    console.error("Reply Update Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
