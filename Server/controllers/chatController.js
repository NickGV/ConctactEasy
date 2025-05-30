const Message = require("../models/Message");
const Chat = require("../models/Chat");
const User = require("../models/User");

exports.getOrCreateChat = async (req, res, next) => {
  const { phoneNumber } = req.body;
  const userId = req.user.id;
  try {
    const contact = await User.findOne({ phoneNumber });
    if (!contact) {
      const error = new Error("Contact not found");
      error.statusCode = 404;
      return next(error);
    }

    let chat = await Chat.findOne({
      participants: { $all: [userId, contact._id] },
      deletedFor: { $ne: userId }
    });

    if (chat) {
      const messages = await Message.find({ chatId: chat._id }).sort({
        timestamp: 1,
      });
      return res.json({ chat, messages });
    }

    chat = await Chat.findOne({
      participants: { $all: [userId, contact._id] },
      deletedFor: userId
    });

    if (chat) {
      chat.deletedFor = chat.deletedFor.filter(id => id.toString() !== userId);
      await chat.save();
      const messages = await Message.find({ chatId: chat._id }).sort({
        timestamp: 1,
      });
      return res.json({ chat, messages });
    }

    chat = new Chat({
      participants: [userId, contact._id],
      deletedFor: []
    });

    await chat.save();

    await User.updateMany(
      { _id: { $in: [userId, contact._id] } },
      { $push: { chats: chat._id } }
    );

    res.status(201).json({ chat });
  } catch (error) {
    next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user.id;
  
  try {
    const chat = await Chat.findById(chatId).populate({
      path: "messages",
      options: { sort: { timestamp: 1 } },
    });

    if (!chat) {
      const error = new Error("Chat not found");
      error.statusCode = 404;
      return next(error);
    }

    if (chat.deletedFor.includes(userId)) {
      const error = new Error("Chat not found");
      error.statusCode = 404;
      return next(error);
    }

    res.json(chat.messages);
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  const { chatId, content } = req.body;
  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      const error = new Error("Chat not found");
      error.statusCode = 404;
      return next(error)
    }

    if (!chat.participants.includes(req.user.id)) {
      const error = new Error("Not authorized");
      error.statusCode = 403;
      return next(error);
    }

    if (chat.deletedFor.includes(req.user.id)) {
      chat.deletedFor = chat.deletedFor.filter(id => id.toString() !== req.user.id);
      await chat.save();
    }

    const message = new Message({
      chatId,
      senderId: req.user.id,
      content,
    });

    const io = req.app.get("io");
    io.to(chatId).emit("sendMessage", message);

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

exports.deleteChat = async (req, res, next) => {
 const {chatId} = req.params
 const userId = req.user.id;

 try{
  const chat = await Chat.findById(chatId)

  if(!chat){
    const error = new Error("Chat not found")
    error.statusCode = 404
    return next(error)
  }

  if (!chat.participants.includes(userId)) {
    const error = new Error("Not authorized");
    error.statusCode = 403;
    return next(error);
  }

  if (!chat.deletedFor.includes(userId)) {
    chat.deletedFor.push(userId);
    await chat.save();
  }
  
  res.json({message: "Chat deleted for you"})
 } catch (error){
   next(error)
 }
}

exports.getChats = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const chats = await Chat.find({ 
      participants: userId,
      deletedFor: { $ne: userId }
    }).populate('participants', 'username phoneNumber email');
    
    res.json(chats)
  }catch(error){
    next(error)
  }
}