import React from 'react';

const OrdersTable = () => {
    const orders = [
        { name: 'Star Refrigerator', price: '$1200', payment: 'Paid', status: 'Delivered' },
        { name: 'Dell Laptop', price: '$110', payment: 'Due', status: 'Pending' },
        { name: 'Apple Watch', price: '$1200', payment: 'Paid', status: 'Return' },
        { name: 'Addidas Shoes', price: '$620', payment: 'Due', status: 'In Progress' },
    ];

    return (
        <div className="recentOrders">
            <div className="cardHeader">
                <h2>Recent Orders</h2>
                <a href="#" className="btn">View All</a>
            </div>
            <table>
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Price</td>
                        <td>Payment</td>
                        <td>Status</td>
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order, index) => (
                        <tr key={index}>
                            <td>{order.name}</td>
                            <td>{order.price}</td>
                            <td>{order.payment}</td>
                            <td><span className={`status ${order.status.toLowerCase().replace(' ', '-')}`}>{order.status}</span></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersTable;