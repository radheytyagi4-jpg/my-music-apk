import Axios from "axios";
import { baseUrl } from "../config.js";
import { getUserId } from "./session";

const api = Axios.create({
  baseURL: `${baseUrl}/playlists`,
  timeout: 20000,
});

const currentUser = async () => {
  const userId = await getUserId();

  if (!userId) {
    throw new Error("Please register first");
  }

  return userId;
};

export const errorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Something went wrong";

export const toPlaylistSong = (song) => ({
  id: String(song.id),
  tittle: song.tittle || song.title || "Unknown Song",
  artist: song.artist || "Unknown Artist",
  img: song.img || null,
  audioUrl: song.audioUrl,
});

export const toPlayableSongs = (songs = []) =>
  songs.map((song) => ({
    id: song.songId,
    tittle: song.tittle,
    artist: song.artist,
    img: song.img,
    audioUrl: song.audioUrl,
  }));

export const createPlaylist = async ({ name, description, visibility }) => {
  const userId = await currentUser();
  const res = await api.post("/", { userId, name, description, visibility });
  return res.data.data;
};

export const getMyPlaylists = async (songId) => {
  const userId = await currentUser();
  const res = await api.get("/mine", { params: { userId, songId } });
  return res.data.data;
};

export const browsePlaylists = async (q) => {
  const res = await api.get("/browse", { params: { q: q || undefined } });
  return res.data.data;
};

export const getPlaylist = async (id) => {
  const userId = await currentUser();
  const res = await api.get(`/${id}`, { params: { userId } });
  return res.data.data;
};

export const updatePlaylist = async (id, changes) => {
  const userId = await currentUser();
  const res = await api.patch(`/${id}`, { userId, ...changes });
  return res.data.data;
};

export const deletePlaylist = async (id) => {
  const userId = await currentUser();
  await api.delete(`/${id}`, { params: { userId } });
};

export const addSongToPlaylist = async (id, song) => {
  const userId = await currentUser();
  const res = await api.post(`/${id}/songs`, {
    userId,
    song: toPlaylistSong(song),
  });
  return res.data.data;
};

export const removeSongFromPlaylist = async (id, songId) => {
  const userId = await currentUser();
  await api.delete(`/${id}/songs/${encodeURIComponent(songId)}`, {
    params: { userId },
  });
};

export const followPlaylist = async (id) => {
  const userId = await currentUser();
  await api.post(`/${id}/follow`, { userId });
};

export const unfollowPlaylist = async (id) => {
  const userId = await currentUser();
  await api.delete(`/${id}/follow`, { params: { userId } });
};
