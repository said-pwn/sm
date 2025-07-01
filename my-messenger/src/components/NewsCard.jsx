import React, { useState } from 'react';
import { Heart } from 'lucide-react';

const NewsCard = ({ post }) => {
  const [likes, setLikes] = useState(post.likes || 0);
  const [liked, setLiked] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikes((prev) => prev + (liked ? -1 : 1));
  };

  return (
    <div className="bg-surface rounded-2xl shadow-lg p-4 mb-6 hover:shadow-xl transition-all">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{post.title}</h2>
        <p className="text-sm text-gray-400">{post.date}</p>
      </div>
      {post.image && (
        <img
          src={post.image}
          alt="post"
          className="rounded-xl w-full mb-4 object-cover max-h-64"
        />
      )}
      <p className="text-gray-300 mb-4">{post.content}</p>
      <div
        className={`flex items-center gap-2 cursor-pointer w-fit select-none ${
          liked ? 'text-accent' : 'text-gray-400 hover:text-accent'
        }`}
        onClick={handleLike}
      >
        <Heart fill={liked ? '#ff3c78' : 'none'} size={20} />
        <span>{likes}</span>
      </div>
    </div>
  );
};

export default NewsCard;
