import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export const getConversations = async () => {
    const response = await axios.get(`${API_URL}/chat/conversations`, { withCredentials: true });
    return response.data;
};

export const getMessages = async (conversationId) => {
    const response = await axios.get(`${API_URL}/chat/messages/${conversationId}`, { withCredentials: true });
    return response.data;
};

export const sendMessage = async (formData) => {
    const response = await axios.post(`${API_URL}/chat/send`, formData, {
        withCredentials: true,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return response.data;
};

export const editMessage = async (messageId, text) => {
    try {
        const response = await axios.put(`${API_URL}/chat/edit`, { messageId, text }, { withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const deleteMessage = async (messageId) => {
    try {
        const response = await axios.delete(`${API_URL}/chat/delete`, { data: { messageId }, withCredentials: true });
        return response.data;
    } catch (error) {
        throw error;
    }
}
