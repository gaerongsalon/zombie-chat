import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:faker/faker.dart';

import 'bloc/bloc.dart';
import 'models/chat.dart';
import 'widgets/widgets.dart';

class ChatPage extends StatefulWidget {
  ChatPage({Key key}) : super(key: key);

  @override
  _ChatPageState createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  final _name = faker.person.firstName();
  final _bloc = ChatBloc();

  @override
  void initState() {
    super.initState();
    this._bloc.dispatch(Connect());
  }

  @override
  void dispose() {
    this._bloc.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: BlocProvider(
            builder: (context) => this._bloc,
            child: BlocBuilder(
              bloc: this._bloc,
              builder: this._buildContent,
            )),
      ),
    );
  }

  Padding _buildContent(BuildContext context, ChatState state) {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(children: [
        Expanded(
          child: MessageItemList(),
        ),
        Container(
            alignment: Alignment.centerRight,
            padding: const EdgeInsets.only(top: 8),
            child: SpeakButton(onUp: this._send)),
      ]),
    );
  }

  void _send(String text) {
    this._bloc.dispatch(SendChat(
            chat: Chat(
          name: this._name,
          text: text,
        )));
  }
}
