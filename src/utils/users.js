const users = []

const addUser = ({ id, username, room }) => {
    username = username.trim();
    username = username.charAt(0).toUpperCase() + username.substr(1).toLowerCase();
    room = room.trim();
    room = room.charAt(0).toUpperCase() + room.substr(1).toLowerCase();

    if(!username || !room) {
        return {
            error: 'Username and Chat room are required!'
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    })

    if(existingUser) {
        return {
            error: 'Username is already in use!'
        }
    }

    const user = { id, username, room }
    users.push(user);
    return {user}
}


const removeUser = (id) => {
    const index = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find((user)=> {
        return user.id === id;
    })
}

const getUsersInRoom = (room) => {
    return users.filter((user)=>{
        return user.room === room;
    })
}

module.exports = {
    getUser,
    addUser,
    getUsersInRoom,
    removeUser
}