import { StyleSheet, Text, View } from "react-native";
import React from "react";
import PlaylistComponent from "@/components/playlistComponent";

const playlists = () => {
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
          title: "romance",
          image:
            "https://i.scdn.co/image/ab67616d0000b273b95e1e32951c1d162611dd0f",
          perma_url:
            "https://www.jiosaavn.com/featured/best-of-romance-telugu/RvsohkkonJJieSJqt9HmOQ__",
        },
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
    {
      category: "Top Picks -Telugu",
      playlists: [
        {
          title: "Tollywood old Hits",
          image:
            "https://c.saavncdn.com/editorial/CarvaanOldTeluguHits_20250213125638.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/carvaan-old-telugu-hits/ougNCkQhppI14faDlWgB3A__",
        },
        {
          title: "Latest",
          image:
            "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84f8d7864252f1665f5781b5c0",
          perma_url:
            "https://www.jiosaavn.com/featured/telugu-india-superhits-top-50/4O6DwO-qteN613W6L-cCSw__",
        },
        {
          title: "Devi sri prasad",
          image:
            "https://images.filmibeat.com/img/2017/06/devi-sri-prasad-05-1496678125.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/devi-sri-prasad-love-songs-telugu/O7KTby5OvZc_",
        },
        {
          title: "Trending",
          image:
            "https://play-lh.googleusercontent.com/CrmKhlzLMV5K4K4zesBxj9Z9m77ix0hYbI4-PJ2SVzMjchbAVTz117-XhutQYKWI-YU",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/telugu-fresh/cIhOKLoO,p2Tb7czG7lKZg__",
        },
        {
          title: "Sid Sriram",
          image:
            "https://i.pinimg.com/236x/fd/b2/f9/fdb2f984b7ad68936faef2609c60a9e7.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/lets-play-sid-sriram-telugu/JPy8PzDyxH6O0eMLZZxqsA__",
        },
        {
          title: "Anirudh",
          image:
            "https://s.saregama.tech/image/c/m/9/f4/8f/anirudh-ravichander_1644397954.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/lets-play-anirudh-ravichander-telugu/LZtDTjF3OME_",
        },
        {
          title: "Thaman",
          image:
            "https://a10.gaanacdn.com/gn_img/artists/21GWwR3pkg/1GWwr1zL3p/size_m_1717411841.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/lets-play---s-thaman---telugu/JV0ngBo2tro_",
        },
      ],
    },
    {
      category: "Top Picks -Hindi",
      playlists: [
        {
          title: "Bollywood old Hits",
          image:
            "https://c.saavncdn.com/000/Old-Bollywood-Songs-Unplugged-Hindi-2022-20220624143949-500x500.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/100-years-100-songs/Jw,y2RsW58E_",
        },
        {
          title: "Latest",
          image:
            "https://a10.gaanacdn.com/gn_pl_img/playlists/ZaP37OR3Dy/aP37am6RbD/size_m_1621664572.webp",
          perma_url:
            "https://www.jiosaavn.com/featured/hindi-hit-songs/ZodsPn39CSjwxP8tCU-flw__",
        },
        {
          title: "Retro",
          image:
            "https://c.saavncdn.com/500/Bollywood-Retro-Hits-of-90s-Hindi-2017-500x500.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/best-of-retro/IFTYFbu2anRuOxiEGmm6lQ__",
        },
        {
          title: "Recent Release",
          image:
            "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da848ae3aca570c10cca398c3335",
          perma_url:
            "https://www.jiosaavn.com/featured/taaza-tunes/Me5RridRfDk_",
        },
        {
          title: "Arjith Singh",
          image:
            "https://i.scdn.co/image/ab6761610000e5eb5ba2d75eb08a2d672f9b69b7",
          perma_url:
            "https://www.jiosaavn.com/featured/lets-play-arijit-singh-hindi/Iz0pi7nkjUE_",
        },
        {
          title: "Yo Yo Honey Singh",
          image:
            "https://i.scdn.co/image/ab6761610000e5ebbc7e4fffd515b47ff1ebbc1f",
          perma_url:
            "https://www.jiosaavn.com/featured/lets-play-yo-yo-honey-singh-hindi/2G5FSf,-XaM_",
        },
        {
          title: "Sad songs",
          image:
            "https://i1.sndcdn.com/artworks-y0Luzy9CQkb8S1Ss-4qSCaw-t500x500.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/best-of-sad-songs-hindi/WjjhR,A3iLLuCJW60TJk1Q__",
        },
      ],
    },

    {
      category: "English",
      playlists: [
        {
          title: "Latest Songs",
          image:
            "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da845745289d131cb783f03fd007",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/latestenglish/T4nlXjth-mLqIp77B1JF,A__",
        },
        {
          title: "Trending",
          image:
            "https://upload.wikimedia.org/wikipedia/en/1/12/Lady_Gaga_and_Bruno_Mars_-_Die_with_a_Smile.png",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/englishplaylist/RoybTvNFqtXgEhiRleA1SQ__",
        },
        {
          title: "Most Liked Songs",
          image:
            "https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84587ecba4a27774b2f6f07174",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/likedenglish/xY6rSLZm3pqTAzg4ZUD9PQ__",
        },
        {
          title: "Trending",
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSMKbyyRACm6prIZo8QKuS3wnxxumP-9fhGQ_jqXf9oMiSc-h1f3b00JHCXzZwElfmuTZE&usqp=CAU",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/trendingenglish/0NN-xMg1Ak4rMQGDkCmGvg__",
        },
        {
          title: "ED Sheeran",
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHd9b3PiCAthzw6VM7fkwsNaoPZFalaVpvOg&s",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/edsheeran/tJyMph3oK8ml7JpGxdAPvw__",
        },
        {
          title: "Justin Bieber",
          image:
            "https://upload.wikimedia.org/wikipedia/en/thumb/d/d1/Babycoverart.jpg/220px-Babycoverart.jpg",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/justin-biber/tJyMph3oK8l5b0dfvYvasw__",
        },
        {
          title: "Taylor Swift",
          image:
            "https://i.scdn.co/image/ab67616d0000b273e787cffec20aa2a396a61647",
          perma_url:
            "https://www.jiosaavn.com/s/playlist/350353696f7fb3dcc8fd64169489fe55/taylor-swift/NIlPCPRuW7YZNLR,rP3WSg__",
        },
      ],
    },
    {
      category: "Tamil",
      playlists: [
        {
          title: "2024 Hits",
          image:
            "https://c.saavncdn.com/editorial/Chartbusters2024Tamil_20241205112832.jpg?bch=1733399977",
          perma_url:
            "https://www.jiosaavn.com/featured/tamil-india-superhits-top-50/Dq3pWn1coqesud-ETNX4vg__",
        },
        {
          title: "Dhanush",
          image:
            "https://a10.gaanacdn.com/gn_img/artists/Dk9KN2KBx1/k9KNDlBWBx/size_m_1738566001.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/lets-play-dhanush-tamil/orofXc4Dfvc_",
        },
        {
          title: "Romantic",
          image:
            "https://c.saavncdn.com/editorial/BestofRomanceTamil_20250301055332.jpg",
          perma_url:
            "https://www.jiosaavn.com/featured/best-of-romance-tamil/P2sTu90EH1sZmWp1Op3nVA__",
        },
        {
          title: "Vijay Talapathy",
          image:
            "https://i.scdn.co/image/ab67616100005174d8f08b897814e1bf70efccfa",
          perma_url:
            "https://www.jiosaavn.com/featured/lets-play-vijay/-KAZYpBulyM_",
        },
        {
          title: "Trending",
          image:
            "https://c.saavncdn.com/editorial/charts_TrendingToday_134351_20230826113717.jpg?bch=1743814801",
          perma_url:
            "https://www.jiosaavn.com/featured/trending-today/I3kvhipIy73uCJW60TJk1Q__",
        },
        {
          title: "Most searched",
          image:
            "https://c.saavncdn.com/editorial/MostSearchedSongsTamil_20250401095419.jpg?bch=1743503100",
          perma_url:
            "https://www.jiosaavn.com/featured/most-searched-songs-tamil/TSfQp8AhNQel7JpGxdAPvw__",
        },
        {
          title: "Anirudh-Tamil",
          image:
            "https://i.scdn.co/image/ab67616d0000b2731edf696a64afb583b45e0f93",
          perma_url:
            "https://www.jiosaavn.com/featured/lets-play-anirudh-ravichander-tamil/ePUVUJs1h,E_",
        },
      ],
    },
  ];

  return (
    <>
      <View className="pt-5 pl-5">
        <Text style={styles.textFont}>Playlists</Text>
        <PlaylistComponent data={data} />
      </View>
    </>
  );
};

export default playlists;

const styles = StyleSheet.create({
  textFont: {
    fontFamily: "Nunito-Bold",
    fontSize: 25,
  },
  activeText: {
    fontFamily: "Poppins-SemiBold",
    fontSize: 18,
  },
});
