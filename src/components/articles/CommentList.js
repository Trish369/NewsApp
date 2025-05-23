import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { formatCommentDate } from '../../utils/dateFormatter';

/**
 * Component to display a list of comments
 * @param {Object} props - Component props
 * @param {Array} props.comments - Array of comment objects
 * @returns {JSX.Element} CommentList component
 */
function CommentList({ comments }) {
  return (
    <div className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <UserCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">
                  {comment.is_anonymous ? 'Anonymous' : comment.user_name || 'User'}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatCommentDate(comment.created_at)}
                </p>
              </div>
              <div className="mt-2 text-sm text-gray-700">
                <p>{comment.text}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CommentList;