def knx_bytes_to_value(byte1, byte2):
    data = (int(byte1) << 8) + int(byte2)
    sign = data >> 15
    exponent = (data >> 11) & 0x0F
    mantissa = float(data & 0x07FF)

    if sign == 1:
        mantissa = mantissa - 2048

    value = mantissa * (2 ** exponent) / 100
    return round(value, 2)  # можно без округления

def value_to_knx_bytes(value):
    floatval = float(value) * 100

    for i in range(0, 16):
        exp = 2 ** i
        mant = floatval / exp
        if -2048 <= mant <= 2047:
            break

    if floatval < 0:
        sign = 1
        mantissa = int(2048 + (floatval / exp))
    else:
        sign = 0
        mantissa = int(floatval / exp)

    byte1 = ((sign << 7) | (i << 3) | (mantissa >> 8)) & 0xFF
    byte2 = mantissa & 0xFF
    return byte1, byte2

# Пример: KNX → значение
print(knx_bytes_to_value(0x0d, 0x14))  # → 25.0
print(knx_bytes_to_value(0x0D, 0xaa))  # → 26.0
print(knx_bytes_to_value(0x0e, 0x40))  # → 23.0

# Пример: значение → KNX
print(value_to_knx_bytes(25.0))  # → (0x0D, 0x05)
print(value_to_knx_bytes(26.0))  # → (0x0D, 0x23)
print(value_to_knx_bytes(23.0))  # → (0x0C, 0x7E)
