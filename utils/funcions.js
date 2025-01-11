export const searchOrCreateRoom = (firstUsername, secondUsername) => {
  for (const [roomNumber, usersInRoom] of Object.entries(openRooms)) {
    if (
      usersInRoom.includes(secondUsername) &&
      usersInRoom.includes(firstUsername)
    ) {
      console.log("existing room found: " + roomNumber);

      return roomNumber;
    }
  }
  const newChatRoomNumber = ++roomChatsNumber;
  console.log("new room was created: " + newChatRoomNumber);
  openRooms[newChatRoomNumber] = [firstUsername, secondUsername];

  return newChatRoomNumber;
};