export const enum ShapeFlags {
  ELEMENT = 1, //二进制：0001
  STATEFUL_COMPONENT = 1 << 1, //二进制：0010
  TEXT_CHILDREN = 1 << 2, //二进制：0100
  ARRAY_CHILDREN = 1 << 3, //二进制：1000
  SLOT_CHILDREN = 1 << 4,
}
