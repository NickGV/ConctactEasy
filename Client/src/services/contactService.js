import axios from 'axios'

const API_URL = 'http://localhost:3000/api/contacts'

const getAuthHeaders = () => {
  const token = localStorage.getItem('token')
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
}

export const getContacts = async () => {
  try {
    const response = await axios.get(API_URL, getAuthHeaders())
    return response.data
  } catch (error) {
    return error
  }
}

export const addContact = async ({ name, email, phoneNumber, notes }) => {
  try {
    const response = await axios.post(`${API_URL}/add`, { name, email, phoneNumber, notes }, getAuthHeaders())
    return response.data
  } catch (error) {
    return error
  }
}

export const updateContact = async ({ id, name, email, phoneNumber, notes, isFavorite }) => {
  try {
    const response = await axios.put(`${API_URL}/update/${id}`, { name, email, phoneNumber, notes, isFavorite }, getAuthHeaders())
    return response.data
  } catch (error) {
    return error
  }
}

export const deleteContact = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/delete/${id}`, getAuthHeaders())
    return response.data
  } catch (error) {
    return error
  }
}

export const getContactById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders())
    return response.data
  } catch (error) {
    return error
  }
}
