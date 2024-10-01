import React from 'react';
import './numbers.css';
import zero from '../images/zero.jpeg';
import one from '../images/one.jpeg';
import two from '../images/two.jpeg';
import three from '../images/three.jpeg';
import four from '../images/four.jpeg';
import five from '../images/five.jpeg';
import six from '../images/six.jpeg';
import seven from '../images/seven.jpeg';
import eight from '../images/eight.jpeg';
import nine from '../images/nine.jpeg';

const Numbers = () => {
    const numbers = [
        { number: '0', handSign: zero, gujarati: '૦' },
        { number: '1', handSign: one, gujarati: '૧' },
        { number: '2', handSign: two, gujarati: '૨' },
        { number: '3', handSign: three, gujarati: '૩' },
        { number: '4', handSign: four, gujarati: '૪' },
        { number: '5', handSign: five, gujarati: '૫' },
        { number: '6', handSign: six, gujarati: '૬' },
        { number: '7', handSign: seven, gujarati: '૭' },
        { number: '8', handSign: eight, gujarati: '૮' },
        { number: '9', handSign: nine, gujarati: '૯' },
      ];

  return (
    <div className="numbers-container">
      <h1>Numbers 0-9 with Hand Signs and Gujarati Numerals</h1>
      <table className="numbers-table">
        <thead>
          <tr>
            <th>Number</th>
            <th>Hand Sign</th>
            <th>Gujarati Numeral</th>
          </tr>
        </thead>
        <tbody>
          {numbers.map((item, index) => (
            <tr key={index}>
              <td>{item.number}</td>
              <td>
                <img src={item.handSign} alt={`Sign for ${item.number}`} className="hand-sign" />
              </td>
              <td>{item.gujarati}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Numbers;