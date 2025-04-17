import React from 'react';

const RecentCustomers = () => {
    const customers = [
        { name: 'John Doe', img: 'assets/imgs/customer02.jpg' },
        { name: 'Jane Smith', img: 'assets/imgs/customer03.jpg' },
        { name: 'Alice Johnson', img: 'assets/imgs/customer04.jpg' },
        { name: 'Bob Brown', img: 'assets/imgs/customer05.jpg' },
    ];

    return (
        <div className="recentCustomers">
            <div className="cardHeader">
                <h2>Recent Customers</h2>
            </div>
            <table>
                <tbody>
                    {customers.map((customer, index) => (
                        <tr key={index}>
                            <td width="60px">
                                <div className="imgBx">
                                    <img src={customer.img} alt={customer.name} />
                                </div>
                            </td>
                            <td>
                                <h4>{customer.name}</h4>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RecentCustomers;