import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { fetch } from "@react-native-community/netinfo";
import { router, useRootNavigationState } from "expo-router";
const redirectComponent = () => {
  const [isConnected, setIsConnected] = useState(true);
  const rootNavigationState = useRootNavigationState();

  const fetchConnection = () =>
    fetch().then((state) => {
      setIsConnected(state.isConnected);
    });
  useEffect(() => {
    fetchConnection();
  }, []);

  useEffect(() => {
    if (!isConnected && rootNavigationState?.key) {
      router.push("/downloads");
    }
  }, [isConnected, rootNavigationState?.key]);

  return <></>;
};

export default redirectComponent;

const styles = StyleSheet.create({});
