import React from 'react';
import axios from 'axios';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, TextInput, Alert, FlatList, Dimensions, Image } from 'react-native';
import { SafeAreaView } from "react-native-safe-area-context";
import { Audio } from "expo-av";

const { width, height } = Dimensions.get("screen");
const SPACING = 12;

export default function App() {
  const [query, setQuery] = React.useState(null);
  const [result, setResult] = React.useState([{
    data: {
      uri: " ",
      name: "",
      albumOfTrack: {
        coverArt: { sources: [{ url: " " }] },
      },
      artists: { items: [{ profile: { name: " " } }] }
    }
  }]);
  const [currentSound, setCurrentSound] = React.useState(null);

  async function onCheckOut() {
    const options = {
      method: 'GET',
      url: 'https://spotify23.p.rapidapi.com/search/',
      params: {
        q: query,
        type: 'multi',
        offset: 0,
        limit: 10,
        numberOfTopResults: 5
      },
      headers: {
        'X-RapidAPI-Key': '1e1b103361mshe0843c42f0565bep115d74jsn1ee95e325b9c',
        'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
      }
    };

    try {
      const response = await axios.request(options);
      console.log(response.data.tracks.items);
      setResult(response.data.tracks.items);
    } catch (error) {
      console.error(error);
    }
  }

  async function getTrack(id) {
    const options = {
      method: 'GET',
      url: 'https://spotify23.p.rapidapi.com/tracks/',
      params: {
        ids: id
      },
      headers: {
        'X-RapidAPI-Key': '1e1b103361mshe0843c42f0565bep115d74jsn1ee95e325b9c',
        'X-RapidAPI-Host': 'spotify23.p.rapidapi.com'
      }
    };
    try {
      const response = await axios.request(options);
      return response.data
    } catch (error) {
      console.error(error);
    }
  }

  const play = async (track) => {
    const id = track.data.id;
    const actualTrack = await getTrack(id);
    const url = actualTrack.tracks[0].preview_url;
    console.log(url);
    try {
      if (currentSound) {
        await currentSound.stopAsync();
      }
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });
      const { sound, status } = await Audio.Sound.createAsync(
        {
          uri: url,
        },
        {
          shouldPlay: true,
          isLooping: false,
        },
        onPlaybackStatusUpdate
      );
      onPlaybackStatusUpdate(status);
      setCurrentSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.log(err.message);
    }
  }

  const onPlaybackStatusUpdate = async (status) => {
    return
  };


  return (
    <SafeAreaView style={{ marginTop: 60 }}>
      <View style={{ flexDirection: "row", gap: 12, marginLeft: 12 }}>
        <TextInput
          placeholder='Enter the query'
          style={styles.amtIP}
          onChangeText={(txt) => setQuery(txt)}
          value={query}
        />
        <Pressable style={({ pressed }) => [styles.btn, pressed && { opacity: 0.5 }]} onPress={() => { onCheckOut() }}>
          <Text style={styles.txt}>Search</Text>
        </Pressable>
      </View>
      <View style={styles.separator}></View>
      <View style={{ marginLeft: 12 }}>
        <Text style={{ fontWeight: "bold", marginTop: 12, color: "#444", fontSize: 20 }}>Songs that match your search...</Text>
        <FlatList
          data={result}
          keyExtractor={(_, index) => index}
          renderItem={({ item, index }) => {
            return (
              <Pressable style={({ pressed }) => [styles.musicCard, pressed && { opacity: 0.5 }]} onPress={() => { play(item) }}>
                <View style={styles.img}>
                  <Image source={{ uri: item.data.albumOfTrack.coverArt.sources[0].url }} style={{ height: 50, width: 50, borderRadius: 25, resizeMode: "cover" }} />
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ fontWeight: "bold" }}>{item.data.name}</Text>
                  <View style={{ flexDirection: "row" }}>
                    {item.data.artists.items.map((item, index) => {
                      return (
                        <Text key={index} style={{ fontWeight: "bold", color: "#4e4e53be", fontSize: 12 }}>
                          {item.profile.name}
                        </Text>
                      )
                    })}
                  </View>
                </View>
              </Pressable>
            )
          }}
        />
      </View>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  musicCard: {
    borderWidth: 0.5,
    borderColor: "#4e4f5266",
    height: 60,
    width: width - 24,
    marginVertical: SPACING,
    borderRadius: SPACING,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING
  },
  separator: {
    borderWidth: 0.5,
    borderColor: "#38383a7e",
    marginTop: 12
  },
  txt: {
    color: "white",
    fontWeight: "bold"
  },
  btn: {
    backgroundColor: "#209dbc",
    width: 60,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12
  },
  amtIP: {
    borderWidth: 0.5,
    borderColor: "#5f5f6291",
    width: 200,
    height: 30,
    borderRadius: 12,
    paddingHorizontal: 6,
    marginBottom: 12
  },
});
