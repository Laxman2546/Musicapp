import { StyleSheet, Text, View } from "react-native";
import React from "react";

const dataComponent = () => {
  const data = [
    {
      category: "Devotional -Telugu",
      playlists: [
        {
          title: "Venkateshwara Swamy",
          image:
            "https://a10.gaanacdn.com/gn_pl_img/playlists/0wrb4qNKLg/rb4AqwYXKL/size_m_1626776350.webp",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/venkateshwara-swamy/wMbW28ObCmczKBnAJhUU2A__",
        },
        {
          title: "Shiva",
          image:
            "https://i.pinimg.com/736x/17/21/68/1721687f42c048ec4c1a99fad73c5685.jpg",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/shiva/sAgp6PR7rKZ71f3QFG7QOA__",
        },
        {
          title: "Krishna",
          image:
            "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84845e9ba7498597f26ec57ded",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/krishna/VSnAb27C4xmj0u3fDhdBUw__",
        },
        {
          title: "Sai Baba",
          image:
            "https://a10.gaanacdn.com/gn_img/albums/0wrb4qNKLg/wrb4Dlo7bL/size_m.jpg",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/saibaba/zKICTO21ISytaPBmwNDuaA__",
        },
        {
          title: "Ganesh",
          image:
            "https://i1.sndcdn.com/artworks-000057256666-le48ai-t500x500.jpg",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/ganesh/RpzeiY8Mx61A1WdkGhiMDg__",
        },
        {
          title: "Ayyappa Swamy",
          image:
            "https://i1.sndcdn.com/artworks-c70c4651-8ce6-436b-ae25-1c4144d63bad-0-t500x500.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/ayyappa-swamy-telugu/ESFgpNeitmA_",
        },
        {
          title: "Hanuman",
          image:
            "https://i.pinimg.com/236x/b6/a5/73/b6a57315cb67225043a80323f69a38ec.jpg",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/hanuman/mG9wVcQe0XOAIonqf0gmcg__",
        },
        {
          title: "Lakshmi Devi",
          image:
            "https://pswebservice.pujaservices.com//ImageFolder/pujas/laxmidevi-archana.jpg",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/lakshmidevi/YyluCT,QmHaMQv7FkH9rjg__",
        },
        {
          title: "Bonalu",
          image:
            "https://c.saavncdn.com/887/Bonalu-Special-Telugu-2018-20180709071229-500x500.jpg",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/bonalu/gjJc0XvZ3edwl9Cu-HDmVQ__",
        },
        {
          title: "Jesus",
          image:
            "https://c.saavncdn.com/035/Christian-Popular-Songs-Telugu-2023-20231226153012-500x500.jpg",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/jesus/ICE5SRNL,tGrMzkbRQZU5w__",
        },
        {
          title: "Muslim",
          image:
            "https://c.saavncdn.com/364/Mehfil-E-Naat-Urdu-2019-20191203183110-500x500.jpg",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/muslim/S7Y68pqtS2pYufGtEEFmDA__",
        },
      ],
    },
    {
      category: "Whats your mood -Telugu",
      playlists: [
        {
          title: "chill",
          image:
            "https://c.saavncdn.com/725/Chill-Vibe-English-2020-20200827001048-500x500.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/chill-boss/,1k21RoWzVvfemJ68FuXsA__",
        },
        {
          title: "Party",
          image:
            "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da8407d9c8aedd921175611806ee",
          perma_url:
            "https://www.jiosaavn.com/featured/pakka-beat/t7M-TsljMEPuCJW60TJk1Q__",
        },
        {
          title: "Sad",
          image:
            "https://resources.tidal.com/images/09d2159e/7b49/4a2a/bac3/d5dbd10bb22d/640x640.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/premaledani/QjNClwMc717ufxkxMEIbIw__",
        },
        {
          title: "Gym Beats",
          image:
            "https://i.scdn.co/image/ab67616d0000b2735ca12e898fac5a6161fbf1df",
          perma_url: "https://www.jiosaavn.com/featured/gym-jam/nbMXkg9nIVI_",
        },
        {
          title: "romance",
          image:
            "https://i.scdn.co/image/ab67616d0000b273b95e1e32951c1d162611dd0f",
          perma_url:
            "https://www.jiosaavn.com/featured/best-of-romance-telugu/RvsohkkonJJieSJqt9HmOQ__",
        },
        {
          title: "Travelling",
          image:
            "https://images.squarespace-cdn.com/content/v1/569fed4e1f4039eff105eceb/1537301441914-1JF9PHMJ5VBTB2ZAHHCV/Facebook+Post+01.jpg?format=1000w",
          perma_url:
            "https://www.jiosaavn.com/featured/travel-telugu/ReQrLXQAvi7c1EngHtQQ2g__",
        },
        {
          title: "Meditation Vibes",
          image:
            "https://m.media-amazon.com/images/I/51yISv961FL._UXNaN_FMjpg_QL85_.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/meditation-vibes-telugu/,hfwrCtqHkI_",
        },
      ],
    },
  ];
  return (
    <View>
      <Text>dataComponent</Text>
    </View>
  );
};

export default dataComponent;

const styles = StyleSheet.create({});
