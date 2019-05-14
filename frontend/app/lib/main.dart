import 'dart:io';
import 'dart:async';

import 'package:flutter/material.dart';

import 'env.g.dart';

void main() => runApp(MyApp());

const title = 'Zombie chat';

class MyApp extends StatelessWidget {
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Zombie chat',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: ChatPage(title: 'Zombie chat'),
    );
  }
}

class ChatPage extends StatefulWidget {
  ChatPage({Key key, this.title}) : super(key: key);

  final String title;

  @override
  _ChatPageState createState() => _ChatPageState();
}

const cryingBegin = '그';
const cryingRepeat = '어';
const cryingEnd = '워';

class _ChatPageState extends State<ChatPage> {
  final _scrollController = new ScrollController();
  final _items = <String>[];
  WebSocket _socket;
  DateTime _pressedStart;
  String _text = cryingBegin + cryingEnd;

  @override
  void initState() {
    super.initState();
    this._connect();
  }

  @override
  void dispose() {
    this._disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(children: [
            Expanded(
              child: Scrollbar(
                child: ListView.builder(
                  controller: this._scrollController,
                  itemCount: this._items.length,
                  itemBuilder: (BuildContext context, int index) => Padding(
                      padding: const EdgeInsets.only(bottom: 6),
                      child: Row(
                        children: <Widget>[
                          Container(
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: Colors.lightBlue.withAlpha(180),
                              ),
                              constraints: BoxConstraints(
                                  maxWidth:
                                      MediaQuery.of(context).size.width - 80),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                    vertical: 8.0, horizontal: 16.0),
                                child: Text(this._items[index]),
                              )),
                        ],
                      )),
                ),
              ),
            ),
            Container(
                alignment: Alignment.centerRight,
                padding: const EdgeInsets.only(top: 8),
                child: GestureDetector(
                    onTapDown: (_) {
                      this._pressedStart = DateTime.now();
                      this._startCrying();
                    },
                    onTapUp: (_) {
                      this._pressedStart = null;
                      this._send(this._text);
                    },
                    onLongPressUp: () {
                      this._pressedStart = null;
                      this._send(this._text);
                    },
                    child: Container(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          color: Colors.yellow.withAlpha(180),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              vertical: 8.0, horizontal: 16.0),
                          child: Text(this._text),
                        ))))
          ]),
        ),
      ),
    );
  }

  void _connect() async {
    this._socket = await WebSocket.connect(EnvironmentVariables.serverUrl);
    print('connected $_socket');
    this._socket.map((value) => value).listen((value) {
      print('receive $value');
      this.setState(() {
        this._items.add(value);
        Timer(
            Duration(milliseconds: 200),
            () => _scrollController
                .jumpTo(_scrollController.position.maxScrollExtent));
      });
    });
  }

  void _disconnect() {
    this._socket.close();
    this._socket = null;
  }

  void _send(String message) {
    print('send $message');
    this._socket.add(message);
  }

  void _updateText(String newText) {
    this.setState(() {
      this._text = newText;
    });
  }

  void _startCrying() async {
    int repeat = 0;
    while (this._pressedStart != null) {
      this._updateText(cryingBegin + cryingRepeat * repeat + cryingEnd);
      await Future.delayed(Duration(milliseconds: 200));
      ++repeat;
    }
    this._updateText(cryingBegin + cryingEnd);
  }
}
