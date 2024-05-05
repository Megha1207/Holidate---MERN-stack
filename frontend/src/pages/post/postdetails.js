import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import './postdetails.css';
import Sidebar from '../SideBarSection/sidebar';

const activities = ['Trekking', 'Rafting', 'Rock Climbing', 'Paragliding', 'Bungee Jumping', 'Skydiving', 
'Historical Sites', 'Museums', 'Local Cuisine', 'Festivals', 'Art Galleries', 'Swimming', 
'Sunbathing', 'Beach Volleyball', 'Surfing', 'Snorkeling', 'Jet Skiing', 'Food Exploration', 
'Wildlife Safari', 'Scuba Diving'];

const PostDetails = () => {
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id: paramsId } = useParams();
  const location = useLocation();
  const locationId = location.state?.data;
  const ID = paramsId || locationId;
  const [base64String, setBase64String] = useState('');
  const [isOwner, setIsOwner] = useState(false); // State to track if current user is owner of post
  const [showModal, setShowModal] = useState(false); // State to track if modal is shown or hidden
  const modalRef = React.useRef(null); // Add ref to Modal component

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/post/view/${ID}`);
        const { data } = response;
        setPost(data);
        setLoading(false);
        const placeholder = data.picture.data;
        setBase64String(placeholder.replace("Binary.createFromBase64('", "").replace("')", ""));
        
        // Check if current user is owner of the post
        const decoded = JSON.parse(localStorage.getItem('auth'));
        setIsOwner(data.userId === decoded.token.user._id);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (ID) {
      fetchPost();
    }
  }, [ID]);

  const handleEdit = () => {
    handleShowModal();
    console.log('Edit post');
  };

  const handleDelete = async() => {
    // Handle delete functionality
    const res1 = await axios.post('/post/delete', ID);
    navigate("/dashboard")
    console.log('Delete post');
  };

  const handleLike = () => {
    // Handle like functionality
    console.log('Like post');
  };

  const handleComment = () => {
    // Handle comment functionality
    console.log('Comment on post');
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Call handleClose method on modalRef when close button is clicked
  const handleCloseButtonClick = () => {
    handleCloseModal();
  };

  return (
    <div className="container">
      <Sidebar className="sidebar" />
      <div className="container py-5">
        <h1 className="mb-4">Post Details</h1>
        {loading && <div>Loading...</div>}
        {error && <div>Error: {error}</div>}
        {post && (
          <div className="card mb-4">
            <img src={`data:${post.picture.contentType};base64,${base64String}`} alt="Image" />
            <div className="card-body">
              <h5 className="card-title">{post.caption}</h5>
              <p className="card-text"><strong>Activity:</strong> {post.activity}</p>
              <p className="card-text"><strong>Location:</strong> {post.location}</p>
              {isOwner ? ( // If owner, show edit and delete buttons
                <div>
                  <button onClick={handleEdit}>Edit</button>
                  <button onClick={handleDelete}>Delete</button>
                </div>
              ) : ( // If not owner, show like and comment buttons
                <div>
                  <button onClick={handleLike}>Like</button>
                  <button onClick={handleComment}>Comment</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Modal
        ref={modalRef} // Add ref to Modal component
        show={showModal}
        onHide={handleCloseModal}
        dialogClassName="custom-modal" // Add custom class name to style the modal
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Post</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <div className="form-group">
              <label htmlFor="caption">Caption</label>
              <input type="text" className="form-control" id="caption" defaultValue={post?.caption} />
            </div>
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input type="text" className="form-control" id="location" defaultValue={post?.location} />
            </div>
            <div className="form-group">
              <label htmlFor="activity">Activity</label>
              <select className="form-control" id="activity">
                <option value="">Select an activity</option>
                {activities.map((activity, index) => (
                  <option key={index} value={activity}>
                    {activity}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseButtonClick}>
            Close
          </Button>
          <Button variant="primary" onClick={handleCloseButtonClick}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PostDetails;