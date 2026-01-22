export const calculateOrderTotal = (items: any[]) => {
    if (!items || !Array.isArray(items)) {
        throw new Error("Invalid items array");
    }

    let totalAmount = 0;
    const processedItems = items.map((item) => {
        if (typeof item.price !== 'number' || item.price < 0) {
            throw new Error("Invalid item price");
        }
        if (typeof item.quantity !== 'number' || item.quantity <= 0) {
            throw new Error("Invalid item quantity");
        }

        const subtotal = item.price * item.quantity;
        totalAmount += subtotal;

        return {
            ...item,
            subtotal,
        };
    });

    return { orderItems: processedItems, totalAmount };
};
