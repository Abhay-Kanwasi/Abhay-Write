"use client"

import axios from 'axios';
import { useState, useEffect } from 'react';

const Quotes = () => {
  const [posts, setPosts] = useState([]);
  const backendUrl = 'http://127.0.0.1:8000'; 

  useEffect(() => {
    const fetchData = async () => {
      try {
         const response = await axios.get(`${backendUrl}/api/posts/`);
         setPosts(response.data);
      } catch (error) {
        console.error('Error fetching posts:', error);
        // Handle errors appropriately (e.g., display an error message)
      }
    };

    fetchData();
  }, []);


  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Quotes;