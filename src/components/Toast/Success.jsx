import React from 'react';

const Success = () => {r
    const handleSubmit = () => {
        
        // Xử lý login...
        window.FuiToast.success('Success toast message.');
    };
  return (

    <div>
       <button onClick={handleSubmit} >
        Test
       </button>
    </div>
  );
};

export default Success;
