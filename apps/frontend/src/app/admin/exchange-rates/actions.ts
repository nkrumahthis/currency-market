const API_URL = 'http://localhost:5001';

export async function fetchExchangeRates() {
    try {
        const response = await fetch(`${API_URL}/rates`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Failed to fetch exchange rates:', error);
        throw error;
    }
}