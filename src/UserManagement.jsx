import React from "react";

const UserManagement = () => {
  const users = [
    { id: 1, name: "User 1", role: "Admin", lastActivity: "2023-10-01 08:00:00" },
    { id: 2, name: "User 2", role: "Employee", lastActivity: "2023-10-01 18:00:00" },
  ];

  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-semibold text-white mb-4">User Management</h2>
      <table className="w-full text-white">
        <thead>
          <tr>
            <th className="py-2">User</th>
            <th className="py-2">Role</th>
            <th className="py-2">Last Activity</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-gray-700">
              <td className="py-2">{user.name}</td>
              <td className="py-2">{user.role}</td>
              <td className="py-2">{user.lastActivity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
