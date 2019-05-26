import 'package:flutter/material.dart';

const cryingBegin = '그';
const cryingRepeat = '어';
const cryingEnd = '워';

class SpeakButton extends StatefulWidget {
  const SpeakButton({
    Key key,
    @required this.onUp,
  })  : assert(onUp != null),
        super(key: key);

  final void Function(String) onUp;

  @override
  _SpeakButtonState createState() => _SpeakButtonState();
}

class _SpeakButtonState extends State<SpeakButton> {
  DateTime _pressedStart;
  String _text = cryingBegin + cryingEnd;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
        onTapDown: (_) {
          this._pressedStart = DateTime.now();
          this._startCrying();
        },
        onTapUp: (_) {
          this._pressedStart = null;
          this.widget.onUp(this._text);
        },
        onLongPressUp: () {
          this._pressedStart = null;
          this.widget.onUp(this._text);
        },
        child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              color: Colors.yellow.withAlpha(180),
            ),
            child: Padding(
              padding:
                  const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
              child: Text(this._text),
            )));
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
