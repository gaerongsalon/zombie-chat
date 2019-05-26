import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/chat.dart';
import 'text_item.dart';

final timeFormatter = DateFormat.Hm();

class MessageItem extends StatelessWidget {
  const MessageItem({
    Key key,
    @required this.item,
  })  : assert(item != null),
        super(key: key);

  final ChatReply item;

  @override
  Widget build(BuildContext context) {
    final children = [
      Padding(
        padding: item.me
            ? const EdgeInsets.only(left: 6.0)
            : const EdgeInsets.only(right: 6.0),
        child: TextItem(
            item: '${item.text}',
            color: Colors.lightBlue.shade300,
            borderRadius: 32,
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
            constraints: BoxConstraints(
                maxWidth: MediaQuery.of(context).size.width - 80)),
      ),
      Text(
        timeFormatter.format(item.sent),
        style: TextStyle(fontSize: 12),
      ),
    ];
    return Padding(
        padding: const EdgeInsets.only(bottom: 6),
        child: Column(
          crossAxisAlignment:
              item.me ? CrossAxisAlignment.end : CrossAxisAlignment.start,
          children: [
            Text(
              item.name,
              style: TextStyle(fontSize: 12),
            ),
            Row(
              mainAxisAlignment:
                  item.me ? MainAxisAlignment.end : MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: item.me ? children.reversed.toList() : children,
            ),
          ],
        ));
  }
}
