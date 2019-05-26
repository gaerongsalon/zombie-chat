import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/bloc.dart';
import 'message_item.dart';

class MessageItemList extends StatefulWidget {
  MessageItemList({Key key}) : super(key: key);

  _MessageItemListState createState() => _MessageItemListState();
}

class _MessageItemListState extends State<MessageItemList> {
  final _scrollController = ScrollController();

  @override
  Widget build(BuildContext context) {
    return BlocBuilder(
        bloc: BlocProvider.of<ChatBloc>(context), builder: this._buildItemList);
  }

  Widget _buildItemList(BuildContext context, ChatState state) {
    if (state is MessagingChatState) {
      Timer(Duration(milliseconds: 200), () {
        if (_scrollController.hasClients) {
          _scrollController.jumpTo(_scrollController.position.maxScrollExtent);
        }
      });
      return Scrollbar(
        child: ListView.builder(
          controller: this._scrollController,
          itemCount: state.messages.length,
          itemBuilder: (BuildContext context, int index) =>
              MessageItem(item: state.messages[index]),
        ),
      );
    }
    return Container();
  }
}
