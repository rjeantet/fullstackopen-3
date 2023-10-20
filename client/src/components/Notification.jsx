const Notification = ({ message, errorMessage }) => {
  return message ? (
    <div className='message feedback'>{message}</div>
  ) : errorMessage ? (
    <div className='message error'>{errorMessage}</div>
  ) : null;
};

export default Notification;
