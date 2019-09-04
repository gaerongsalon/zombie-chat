import 'package:flutter/material.dart';

class TextItem extends StatelessWidget {
  const TextItem({
    Key key,
    @required this.item,
    this.borderRadius = 12.0,
    this.color = Colors.blueGrey,
    this.constraints,
    this.padding = const EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
  })  : assert(item != null),
        super(key: key);

  final String item;
  final double borderRadius;
  final Color color;
  final BoxConstraints constraints;
  final EdgeInsetsGeometry padding;

  @override
  Widget build(BuildContext context) {
    return Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(this.borderRadius),
          color: this.color,
        ),
        constraints: this.constraints,
        child: Padding(
          padding: this.padding,
          child: Text(this.item),
        ));
  }
}
