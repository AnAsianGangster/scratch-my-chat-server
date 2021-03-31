// TODO use redis or any database to save this users array
const users = [];

function userJoin(id, username, room) {
    const user = { id, username, room };

    users.push(user);

    return user;
}

function getCurrentUser(id) {
    return users.find((user) => user.id === id);
}

function userLeave(id) {
    const index = users.findIndex((user) => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

function getUsersInRoom(room) {
    return users.filter((user) => user.room === room);
}

module.exports = {
    userJoin,
    getCurrentUser,
    userLeave,
    getUsersInRoom,
};
