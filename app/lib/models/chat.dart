import 'package:equatable/equatable.dart';
import 'package:meta/meta.dart';

class Chat extends Equatable {
  final String name;
  final String text;

  Chat({@required this.name, @required this.text})
      : assert(name != null),
        assert(text != null),
        super([name, text]);

  Map<String, dynamic> toJson() => {'name': this.name, 'text': this.text};
}

class ChatReply extends Equatable {
  final String name;
  final String text;
  final bool me;
  final DateTime sent;

  ChatReply(
      {@required this.name,
      @required this.text,
      @required this.me,
      @required this.sent})
      : assert(name != null),
        assert(text != null),
        assert(me != null),
        assert(sent != null),
        super([name, text]);

  factory ChatReply.fromJson(dynamic json) => ChatReply(
      name: json['name'],
      text: json['text'],
      me: json['_me'],
      sent: DateTime.fromMillisecondsSinceEpoch(json['_now']));
}
