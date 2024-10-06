// Home.tsx
import * as React from 'react';
import { StyleSheet, Text, View, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DraxProvider, DraxView } from 'react-native-drax';
import { mockDevices } from './DeviceMockup'; // Import mockDevices

const gestureRootViewStyle = { flex: 1 };

export default function Home() {
  // Transform mockDevices to match the structure expected for draggableItemList
  const transformedDeviceList = mockDevices.map((device) => ({
    id: device.id,
    name: device.name,
    isConnected: device.isConnected, // Track the connection status
    background_color: device.isConnected ? 'green' : 'red', // Set initial color based on connection status
  }));

  const FirstReceivingItemList = [
    {
      id: '13',
      name: '',
      isConnected: false,
      background_color: '#808080',
    },
    {
      id: '14',
      name: '',
      isConnected: false,
      background_color: '#808080',
    },
    {
      id: '15',
      name: '',
      isConnected: false,
      background_color: '#808080',
    },
    {
      id: '16',
      name: '',
      isConnected: false,
      background_color: '#808080',
    }
  ];

  // Use the transformed device list as the initial draggable items
  const [receivingItemList, setReceivedItemList] = React.useState(FirstReceivingItemList);
  const [dragItemMiddleList, setDragItemListMiddle] = React.useState(transformedDeviceList);

  // Toggle the connection status and update the background color
  const toggleConnectionStatus = (index, listType) => {
    if (listType === 'draggable') {
      const updatedList = dragItemMiddleList.map((item, i) => {
        if (i === index) {
          const newConnectionStatus = !item.isConnected; // Toggle the connection status
          return {
            ...item,
            isConnected: newConnectionStatus,
            background_color: newConnectionStatus ? 'green' : 'red', // Update color based on connection status
          };
        }
        return item;
      });
      setDragItemListMiddle(updatedList);
    } else if (listType === 'receiving') {
      const updatedList = receivingItemList.map((item, i) => {
        if (i === index) {
          const newConnectionStatus = !item.isConnected; // Toggle the connection status
          return {
            ...item,
            isConnected: newConnectionStatus,
            background_color: newConnectionStatus ? 'green' : 'red', // Update color based on connection status
          };
        }
        return item;
      });
      setReceivedItemList(updatedList);
    }
  };

  const DragUIComponent = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => toggleConnectionStatus(index, 'draggable')}>
        <DraxView
          style={[styles.centeredContent, styles.draggableBox, { backgroundColor: item.background_color }]}
          draggingStyle={styles.dragging}
          dragReleasedStyle={styles.dragging}
          hoverDraggingStyle={styles.hoverDragging}
          dragPayload={index}
          longPressDelay={150}
          key={index}
        >
          <Text style={styles.textStyle}>{item.name}</Text>
        </DraxView>
      </TouchableOpacity>
    );
  };

  const ReceivingZoneUIComponent = ({ item, index }) => {
    return (
      <TouchableOpacity onPress={() => toggleConnectionStatus(index, 'receiving')}>
        <DraxView
          style={[styles.centeredContent, styles.receivingZone, { backgroundColor: item.background_color }]}
          receivingStyle={styles.receiving}
          renderContent={({ viewState }) => {
            const receivingDrag = viewState && viewState.receivingDrag;
            const payload = receivingDrag && receivingDrag.payload;
            return (
              <View>
                <Text style={styles.textStyle}>{item.name}</Text>
              </View>
            );
          }}
          key={index}
          onReceiveDragDrop={(event) => {
            let selected_item = dragItemMiddleList[event.dragged.payload];
            let newReceivingItemList = [...receivingItemList];
            newReceivingItemList[index] = selected_item;
            setReceivedItemList(newReceivingItemList);

            let newDragItemMiddleList = [...dragItemMiddleList];
            newDragItemMiddleList[event.dragged.payload] = receivingItemList[index];
            setDragItemListMiddle(newDragItemMiddleList);
          }}
        />
      </TouchableOpacity>
    );
  };

  const renderDraggableItems = () => {
    return dragItemMiddleList.map((item, index) => (
      <View style={styles.draggableItemWrapper} key={index}>
        {DragUIComponent({ item, index })}
      </View>
    ));
  };

  const renderReceivingItems = () => {
    return receivingItemList.map((item, index) => (
      <View style={styles.draggableItemWrapper} key={index}>
        {ReceivingZoneUIComponent({ item, index })}
      </View>
    ));
  };

  return (
    <GestureHandlerRootView style={gestureRootViewStyle}>
      <View>
        <Text style={styles.headerStyle}>{'Drag drop and swap between lists'}</Text>
      </View>
      <DraxProvider>
        <View style={styles.container}>
          <View style={styles.receivingContainer}>
            {renderReceivingItems()}
          </View>
          <ScrollView>
            <View style={styles.draxListContainer}>
              {renderDraggableItems()}
            </View>
          </ScrollView>
        </View>
      </DraxProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    paddingTop: 40,
    justifyContent: 'space-evenly',
  },
  centeredContent: {
    borderRadius: 10,
  },
  receivingZone: {
    height: (Dimensions.get('window').width / 2) - 24, // Adjust height for 2 columns
    borderRadius: 10,
    width: (Dimensions.get('window').width / 2) - 24, // Adjust width for 2 columns
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  receiving: {
    borderColor: 'red',
    borderWidth: 2,
  },
  draggableBox: {
    width: (Dimensions.get('window').width / 4) - 24, // Adjust width for 4 columns layout
    height: (Dimensions.get('window').width / 4) - 24, // Adjust height for 4 columns layout
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
  },
  dragging: {
    opacity: 0.2,
  },
  hoverDragging: {
    borderColor: 'magenta',
    borderWidth: 2,
  },
  receivingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Enable wrapping to create multiple rows
    justifyContent: 'space-evenly',
    marginBottom: 20, // Add space between lists
  },
  draxListContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Enable wrapping to create multiple rows
    justifyContent: 'space-evenly',
  },
  draggableItemWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textStyle: {
    fontSize: 18,
  },
  headerStyle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 20,
  },
});
