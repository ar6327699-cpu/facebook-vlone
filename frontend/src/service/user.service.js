import axiosInstance from "./url.service";

export const getAllFriendsRequest = async () => {
    try {
        const response = await axiosInstance.get('/users/friend-request')
        return response?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getAllFriendsSuggestion = async () => {
    try {
        const response = await axiosInstance.get('/users/user-to-request')
        return response?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const followUser = async (userId) => {
    try {
        const response = await axiosInstance.post('/users/follow', { userIdToFollow: userId })
        return response?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const UnfollowUser = async (userIdToUnFollow) => {
    try {
        const response = await axiosInstance.post('/users/unfollow', { userIdToUnFollow })
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

export const unfriendUser = async (userIdToUnfriend) => {
    try {
        const response = await axiosInstance.post('/users/unfriend', { userIdToUnfriend })
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

export const blockUser = async (userIdToBlock) => {
    try {
        const response = await axiosInstance.post('/users/block', { userIdToBlock })
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}

export const unblockUser = async (userIdToUnblock) => {
    try {
        const response = await axiosInstance.post('/users/unblock', { userIdToUnblock })
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}


export const deleteUserFromRequest = async (userId) => {
    try {
        const response = await axiosInstance.post('/users/friend-request/remove', { requestSenderId: userId })
        return response?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const fetchUserProfile = async (userId) => {
    try {
        const response = await axiosInstance.get(`/users/profile/${userId}`)
        return response?.data?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}



export const getMutualFriends = async (userId) => {
    try {
        const response = await axiosInstance.get(`/users/mutual-friends/${userId}`)
        return response?.data?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}



export const updateUserProfile = async (userId, updateData) => {
    try {
        const response = await axiosInstance.put(`/users/profile/${userId}`, updateData)
        return response?.data?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const updateUserCoverPhoto = async (userId, updateData) => {
    try {
        const response = await axiosInstance.put(`/users/profile/cover-photo/${userId}`, updateData)
        return response?.data?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export const createOrUpdateUserBio = async (userId, bioData) => {
    try {
        const response = await axiosInstance.put(`/users/bio/${userId}`, bioData)
        return response?.data?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const togglePrivacy = async () => {
    try {
        const response = await axiosInstance.post('/users/toggle-privacy')
        return response?.data?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getAllUsers = async () => {
    try {
        const response = await axiosInstance.get('/users')
        return response?.data?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getBlockedUsers = async () => {
    try {
        const response = await axiosInstance.get('/users/get-blocked-users')
        return response?.data?.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}





