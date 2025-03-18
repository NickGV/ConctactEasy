import { createContext, useEffect, useState } from 'react'
import { getMessages, getOrCreateChat, sendMessage, getChats, deleteChat } from '../services/chatService'
import { io } from 'socket.io-client'
import { toast } from 'sonner'
import { getUserById } from '../services/authService'
export const ChatContext = createContext()

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])
  const [selectedChat, setSelectedChat] = useState(null)
  const [socket, setSocket] = useState(null)
  const [chats, setChats] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  // Inicializar socket
  useEffect(() => {
    const newSocket = io('http://localhost:3000', {
      query: { token: localStorage.getItem('token') },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    })
    setSocket(newSocket)

    return () => {
      newSocket.off('connect')
      newSocket.off('disconnect')
      newSocket.off('connect_error')
      newSocket.close()
    }
  }, [])

  // Manejar eventos del socket
  useEffect(() => {
    if (!socket) return

    const onConnect = () => {
      console.log('Connected to socket', socket.id)
      setIsConnected(true)

      if (chats && chats.length > 0) {
        console.log(`Joining ${chats.length} chats:`, chats.map(c => c._id))
        const chatIds = chats.map(chat => chat._id)
        socket.emit('joinAllChats', { chatIds })

        if (selectedChat) {
          socket.emit('viewingChat', { chatId: selectedChat._id })
        }
      } else {
        console.log('No chats to join')
      }
    }

    const onDisconnect = () => {
      console.log('Disconnected from socket')
      setIsConnected(false)
    }

    const onConnectError = (error) => {
      console.log('Socket connection error:', error)
      setIsConnected(false)
    }

    const handleNewMessageNotification = async ({ chatId, message }) => {
      console.log('Notification received:', chatId, message)

      try {
        const sender = await getUserById(message.senderId)
        toast.info(`New message from ${sender?.username || 'Someone'}`)

        setChats(prevChats => {
          console.log('Current chats:', prevChats)
          console.log('Looking for chat with ID:', chatId)

          const chatExists = prevChats.some(chat => chat._id === chatId)
          console.log('Chat exists:', chatExists)

          if (!chatExists) {
            console.log('Chat not found in state, fetching chats again')
            getChats().then(newChats => {
              const updatedChats = newChats.map(chat => ({
                ...chat,
                hasNotification: chat._id === chatId ? true : chat.hasNotification || false
              }))
              setChats(updatedChats)
            })
            return prevChats
          }

          return prevChats.map(chat => {
            if (chat._id === chatId) {
              console.log('Setting notification for chat:', chat._id)
              return { ...chat, hasNotification: true }
            }
            return chat
          })
        })
      } catch (error) {
        console.error('Error handling notification:', error)
        toast.info('New message received!')
      }
    }

    const handleMessage = (message) => {
      console.log('Message received:', message)
      setMessages((prevMessages) => [...prevMessages, message])
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onConnectError)
    socket.on('newMessageNotification', handleNewMessageNotification)
    socket.on('sendMessage', handleMessage)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onConnectError)
      socket.off('newMessageNotification', handleNewMessageNotification)
      socket.off('sendMessage', handleMessage)
    }
  }, [socket, chats, selectedChat])

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getChats()
        console.log('Fetched chats:', response)

        const chatsWithNotifications = response.map(chat => ({
          ...chat,
          hasNotification: false
        }))

        setChats(chatsWithNotifications)
      } catch (error) {
        console.error('Error fetching chats:', error)
        toast.error('Failed to load chats')
      }
    }

    fetchChats()
  }, [])

  useEffect(() => {
    if (!socket || !isConnected) return

    if (selectedChat) {
      socket.emit('viewingChat', { chatId: selectedChat._id })
    } else {
      socket.emit('leftChat')
    }
  }, [selectedChat, socket, isConnected])

  const getChatMessages = async (chatId) => {
    try {
      const response = await getMessages(chatId)
      setMessages(response)
    } catch (error) {
      toast.error('Failed to load messages')
      return error
    }
  }

  const addMessage = async (message) => {
    if (!selectedChat || !socket || !isConnected) {
      toast.error('Cannot send message at this time')
      return
    }
    socket.emit('sendMessage', { chatId: selectedChat._id, content: message })
  }

  const createOrGetChat = async (phoneNumber) => {
    try {
      const response = await getOrCreateChat(phoneNumber)
      if (response.chat) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === response.chat._id ? { ...chat, hasNotification: false } : chat
          )
        )
        setSelectedChat(response.chat)
        getChatMessages(response.chat._id)
        socket.emit('joinChat', { chatId: response.chat._id })
        socket.emit('viewingChat', { chatId: response.chat._id })
      }
      return response
    } catch (error) {
      return error
    }
  }

  const deleteChatById = async (chatId) => {
    try {
      const response = await deleteChat(chatId)
      if (response.message && response.message === 'Chat deleted') {
        setChats((prevChats) => prevChats.filter((chat) => chat._id !== chatId))

        if (selectedChat && selectedChat._id === chatId) {
          setSelectedChat(null)
          setMessages([])
          // Informar al servidor que ya no estamos viendo este chat
          socket.emit('leftChat')
        }
      }
      toast.error('Chat deleted')
      return response
    } catch (error) {
      return error
    }
  }

  console.log('Chats with notifications:', chats.filter(chat => chat.hasNotification))

  return (
    <ChatContext.Provider value={{
      getChatMessages,
      addMessage,
      createOrGetChat,
      deleteChatById,
      messages,
      selectedChat,
      setSelectedChat,
      chats,
      setChats
    }}>
      {children}
    </ChatContext.Provider>
  )
}
