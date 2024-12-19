const API_URL = 'http://localhost:5001';

// Action to fetch all orders
export const fetchOrders= async () => {
    console.log("fetching orders action")
    try {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'GET',
        });
        const resjson = await response.json();
        return resjson.data;
    } catch (error) {
        console.error('Error getting orders:', error);
        throw error;
    }
};

// Action to get order by id
export const getOrder = async (orderId: string) => {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
            method: 'GET',
        });
        const order = await response.json();
        return order;
    } catch (error) {
        console.error('Error getting order:', error);
        throw error;
    }
};

// Action to reject order by id
export const rejectOrder = async (orderId: string) => {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}/reject`, {
            method: 'PUT',
        });
        const order = await response.json();
        return order;
    } catch (error) {
        console.error('Error rejecting order:', error);
        throw error;
    }
};

// action to approve order by id

export const approveOrder = async (orderId: string) => {
    try {
        const response = await fetch(`${API_URL}/orders/${orderId}/approve`, {
            method: 'PUT',
        });
        const order = await response.json();
        return order;
    } catch (error) {
        console.error('Error rejecting order:', error);
        throw error;
    }
};