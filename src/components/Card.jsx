import React from 'react';
import { IonIcon } from 'react-ion-icon';
const Card = ({ title, number, icon }) => {
    return (
        <div className="card">
            <div>
                <div className="numbers">{number}</div>
                <div className="cardName">{title}</div>
            </div>
            <div className="iconBx">
                <IonIcon name={icon}></IonIcon>
            </div>
        </div>
    );
};

export default Card;