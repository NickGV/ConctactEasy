import { useContext } from 'react'
import { ChatContext } from '../context/ChatContext.jsx'

const useChat = () => {
  return useContext(ChatContext)
}

export default useChat
