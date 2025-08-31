// Правила для Wirenboard - обработка параметров 69 и 67
// Преобразование KNX байтов в числовые значения (6 байтов = 3 значения)

// Создаем виртуальное устройство для всех параметров KNX
defineVirtualDevice("KNX_HVAC_System", {
    title: "KNX Система HVAC",
    cells: {
        // === ПАРАМЕТР 67 - Базовые уставки кондиционирования ===
        "base_cool_comfort": {
            type: "value",
            value: 0,
            readonly: true,
            title: "67 - Базовая уставка Comfort (°C)",
            units: "°C"
        },
        "base_cool_standby": {
            type: "value",
            value: 0,
            readonly: true,
            title: "67 - Базовая уставка Standby (°C)",
            units: "°C"
        },
        "base_cool_eco": {
            type: "value",
            value: 0,
            readonly: true,
            title: "67 - Базовая уставка ECO (°C)",
            units: "°C"
        },
        
        // === ПАРАМЕТР 69 - Сдвиги уставок кондиционирования ===
        "shift_cool_comfort": {
            type: "value",
            value: 0,
            readonly: true,
            title: "69 - Сдвиг Comfort (K)",
            units: "K"
        },
        "shift_cool_standby": {
            type: "value",
            value: 0,
            readonly: true,
            title: "69 - Сдвиг Standby (K)",
            units: "K"
        },
        "shift_cool_eco": {
            type: "value",
            value: 0,
            readonly: true,
            title: "69 - Сдвиг ECO (K)",
            units: "K"
        },
        
        // === ПАРАМЕТР 105 - Рабочие уставки кондиционирования ===
        "work_cool_comfort": {
            type: "value",
            value: 0,
            readonly: true,
            title: "105 - Рабочая уставка Comfort (°C)",
            units: "°C"
        },
        "work_cool_standby": {
            type: "value",
            value: 0,
            readonly: true,
            title: "105 - Рабочая уставка Standby (°C)",
            units: "°C"
        },
        "work_cool_eco": {
            type: "value",
            value: 0,
            readonly: true,
            title: "105 - Рабочая уставка ECO (°C)",
            units: "°C"
        },
        
        // === ДОПОЛНИТЕЛЬНЫЕ ПАРАМЕТРЫ ===
        "act_pos_cool": {
            type: "value",
            value: 0,
            readonly: true,
            title: "96 - Позиция клапана охлаждения",
            units: "%"
        },
        "fan_speed": {
            type: "value",
            value: 0,
            readonly: true,
            title: "97 - Скорость вентилятора",
            units: "%"
        },
        "hvac_mode": {
            type: "text",
            value: "Неизвестно",
            readonly: true,
            title: "103 - Режим работы HVAC"
        },
        "return_air_temp": {
            type: "value",
            value: 0,
            readonly: true,
            title: "108 - Температура возвратного воздуха",
            units: "°C"
        },
        
        // === РУЧНОЕ УПРАВЛЕНИЕ ===
        "hvac_mode_manual": {
            type: "switch",
            value: false,
            readonly: false,
            title: "60 - Режим HVAC (ручное управление)"
        },
        "hvac_mode_text": {
            type: "text",
            value: "Auto",
            readonly: true,
            title: "60 - Текущий режим HVAC"
        },
        "fan_speed_manual": {
            type: "value",
            value: 0,
            readonly: false,
            title: "74 - Скорость вентилятора (ручное управление)",
            units: "%"
        },
        "fan_speed_text": {
            type: "text",
            value: "Авто",
            readonly: true,
            title: "74 - Текущая скорость вентилятора"
        },
        
        // === УПРАВЛЕНИЕ УСТАВКАМИ ===
        "set_comfort_temp": {
            type: "value",
            value: 26,
            readonly: false,
            title: "Задать температуру Comfort (°C)",
            units: "°C"
        },
        "set_standby_temp": {
            type: "value",
            value: 24,
            readonly: false,
            title: "Задать температуру Standby (°C)",
            units: "°C"
        },
        "set_eco_temp": {
            type: "value",
            value: 22,
            readonly: false,
            title: "Задать температуру ECO (°C)",
            units: "°C"
        },
        
        "test_button": {
            type: "switch",
            value: false,
            readonly: false,
            title: "Тест - Вычислить и отправить сдвиги"
        },
        
        // === СТАТУС ===
        "status": {
            type: "text",
            value: "Ожидание данных...",
            readonly: true,
            title: "Статус системы"
        }
    }
});

// Функция для преобразования KNX байтов в значение (старый способ)
function knxBytesToValue(byte1, byte2) {
    var data = (parseInt(byte1, 16) << 8) + parseInt(byte2, 16);
    var sign = data >> 15;
    var exponent = (data >> 11) & 0x0F;
    var mantissa = parseFloat(data & 0x07FF);

    if (sign === 1) {
        mantissa = mantissa - 2048;
    }

    var value = mantissa * Math.pow(2, exponent) / 100;
    return Math.round(value * 100) / 100;
}

// Новая функция для преобразования 2 байтов в float (IEEE 754 half-precision)
function bytesToFloat(byte1, byte2) {
    try {
        // Преобразуем hex строки в числа
        var b1 = parseInt(byte1, 16);
        var b2 = parseInt(byte2, 16);
        
        // Собираем 16-битное число
        var uint16 = (b1 << 8) | b2;
        
        // Проверяем на специальные значения
        if (uint16 === 0) return 0.0;
        if (uint16 === 0x8000) return -0.0;
        if (uint16 === 0x7C00) return Infinity;
        if (uint16 === 0xFC00) return -Infinity;
        if ((uint16 & 0x7C00) === 0x7C00) return NaN;
        
        // Извлекаем компоненты
        var sign = (uint16 >> 15) & 0x1;
        var exponent = (uint16 >> 10) & 0x1F;
        var mantissa = uint16 & 0x3FF;
        
        // Нормализуем мантиссу
        if (exponent === 0) {
            // Денормализованные числа
            exponent = -14;
        } else {
            exponent = exponent - 15;
            mantissa = mantissa | 0x400; // Добавляем скрытый бит
        }
        
        // Вычисляем значение
        var value = mantissa * Math.pow(2, exponent - 10);
        
        // Применяем знак
        if (sign) value = -value;
        
        return Math.round(value * 1000) / 1000; // Округляем до 3 знаков
    } catch (error) {
        log('Ошибка при преобразовании в float: ' + error);
        return 0.0;
    }
}

// Альтернативная функция для простого преобразования в float
function simpleBytesToFloat(byte1, byte2) {
    try {
        var b1 = parseInt(byte1, 16);
        var b2 = parseInt(byte2, 16);
        
        // Используем правильный алгоритм KNX (как в Python коде)
        var data = (b1 << 8) + b2;
        var sign = data >> 15;
        var exponent = (data >> 11) & 0x0F;
        var mantissa = parseFloat(data & 0x07FF);

        if (sign === 1) {
            mantissa = mantissa - 2048;
        }

        var value = mantissa * Math.pow(2, exponent) / 100;
        return Math.round(value * 100) / 100; // Округляем до 2 знаков
        
    } catch (error) {
        log('Ошибка при простом преобразовании в float: ' + error);
        return 0.0;
    }
}

// Функция для извлечения байтов из hex строки (убираем только первый 0x00)
function extractBytesFromHex(hexString) {
    var allBytes = hexString.split(' ');
    
    // Убираем только первый байт, если он 0x00
    if (allBytes.length > 0 && allBytes[0] === '0x00') {
        allBytes = allBytes.slice(1); // Убираем только первый элемент
    }
    
    log('Все байты после удаления первого 0x00: ' + allBytes.join(' '));
    
    // Проверяем количество байтов и обрабатываем соответственно
    if (allBytes.length >= 6) {
        // Полные 6 байтов (3 значения)
        return {
            byte1: allBytes[0],  // 0x86
            byte2: allBytes[1],  // 0xd4
            byte3: allBytes[2],  // 0x00
            byte4: allBytes[3],  // 0x00
            byte5: allBytes[4],  // 0x00
            byte6: allBytes[5],  // 0x00
            count: 6
        };
    } else if (allBytes.length >= 4) {
        // 4 байта (2 значения)
        return {
            byte1: allBytes[0],
            byte2: allBytes[1],
            byte3: allBytes[2],
            byte4: allBytes[3],
            byte5: '0x00',
            byte6: '0x00',
            count: 4
        };
    } else if (allBytes.length >= 2) {
        // 2 байта (1 значение)
        return {
            byte1: allBytes[0],
            byte2: allBytes[1],
            byte3: '0x00',
            byte4: '0x00',
            byte5: '0x00',
            byte6: '0x00',
            count: 2
        };
    }
    return null;
}

// Основная функция обработки параметра (6 байтов = 3 значения)
function processParameter(hexValue) {
    if (!hexValue || typeof hexValue !== 'string') {
        log('Ошибка: hexValue не является строкой или пустой');
        return null;
    }
    
    log('Обрабатываем строку: ' + hexValue);
    var bytes = extractBytesFromHex(hexValue);
    if (!bytes) {
        log('Ошибка: не удалось извлечь байты');
        return null;
    }
    
    try {
        // Используем новую функцию float для всех значений
        var value1 = simpleBytesToFloat(bytes.byte1, bytes.byte2);
        var value2 = (bytes.count >= 4) ? simpleBytesToFloat(bytes.byte3, bytes.byte4) : 0.0;
        var value3 = (bytes.count >= 6) ? simpleBytesToFloat(bytes.byte5, bytes.byte6) : 0.0;
        
        log('Обработанные значения (float): val1=' + value1 + ', val2=' + value2 + ', val3=' + value3);
        
        return {
            val1: value1,
            val2: value2,
            val3: value3
        };
    } catch (error) {
        log('Ошибка при обработке параметра: ' + error);
        return null;
    }
}

// Правила для Wirenboard
defineRule({
    when: function() {
        return true;
    },
    then: function() {
        var status = "Обработка...";
        var hasData = false;
        
        // Обработка параметра 67 (6 байтов = 3 значения)
        if (dev['Room_2_IN/TRSetpSetCool_67']) {
            var param67Value = dev['Room_2_IN/TRSetpSetCool_67'];
            log('Получен параметр 67: ' + param67Value + ' (тип: ' + typeof param67Value + ')');
            
            var processedValues67 = processParameter(param67Value);
            
            if (processedValues67 !== null) {
                // Сохраняем все 3 значения в виртуальное устройство
                dev['KNX_HVAC_System/base_cool_comfort'] = processedValues67.val1;
                dev['KNX_HVAC_System/base_cool_standby'] = processedValues67.val2;
                dev['KNX_HVAC_System/base_cool_eco'] = processedValues67.val3;
                
                log('Параметр 67 обработан: ' + param67Value + ' → ' + 
                    'Значение 1: ' + processedValues67.val1 + 
                    ', Значение 2: ' + processedValues67.val2 + 
                    ', Значение 3: ' + processedValues67.val3);
                hasData = true;
            } else {
                log('Ошибка: параметр 67 не удалось обработать');
            }
        } else {
            log('Параметр 67 не найден или пустой');
        }
        
        // Обработка параметра 69 (6 байтов = 3 значения)
        if (dev['Room_2_IN/TRSetpSetCoolSh_69']) {
            var param69Value = dev['Room_2_IN/TRSetpSetCoolSh_69'];
            log('Получен параметр 69: ' + param69Value + ' (тип: ' + typeof param69Value + ')');
            
            var processedValues69 = processParameter(param69Value);
            
            if (processedValues69 !== null) {
                // Сохраняем все 3 значения в виртуальное устройство
                dev['KNX_HVAC_System/shift_cool_comfort'] = processedValues69.val1;
                dev['KNX_HVAC_System/shift_cool_standby'] = processedValues69.val2;
                dev['KNX_HVAC_System/shift_cool_eco'] = processedValues69.val3;
                
                log('Параметр 69 обработан: ' + param69Value + ' → ' + 
                    'Значение 1: ' + processedValues69.val1 + 
                    ', Значение 2: ' + processedValues69.val2 + 
                    ', Значение 3: ' + processedValues69.val3);
                hasData = true;
            } else {
                log('Ошибка: параметр 69 не удалось обработать');
            }
        } else {
            log('Параметр 69 не найден или пустой');
        }
        
        // Обработка параметра 105 (6 байтов = 3 значения)
        if (dev['Room_2_OUT/TRSetpSetCoolEff_105']) {
            var param105Value = dev['Room_2_OUT/TRSetpSetCoolEff_105'];
            log('Получен параметр 105: ' + param105Value + ' (тип: ' + typeof param105Value + ')');
            
            var processedValues105 = processParameter(param105Value);
            
            if (processedValues105 !== null) {
                // Сохраняем все 3 значения в виртуальное устройство
                dev['KNX_HVAC_System/work_cool_comfort'] = processedValues105.val1;
                dev['KNX_HVAC_System/work_cool_standby'] = processedValues105.val2;
                dev['KNX_HVAC_System/work_cool_eco'] = processedValues105.val3;
                
                log('Параметр 105 обработан: ' + param105Value + ' → ' + 
                    'Значение 1: ' + processedValues105.val1 + 
                    ', Значение 2: ' + processedValues105.val2 + 
                    ', Значение 3: ' + processedValues105.val3);
                hasData = true;
            } else {
                log('Ошибка: параметр 105 не удалось обработать');
            }
        } else {
            log('Параметр 105 не найден или пустой');
        }
        
        // === ОБРАБОТКА ДОПОЛНИТЕЛЬНЫХ ПАРАМЕТРОВ ===
        
        // Параметр 96 - Позиция клапана охлаждения
        if (dev['Room_2_OUT/ActPosCoolStA_96']) {
            var posValue = dev['Room_2_OUT/ActPosCoolStA_96'];
            log('Получен параметр 96: ' + posValue + ' (тип: ' + typeof posValue + ')');
            
            // Преобразуем значение 0-255 в проценты 0-100%
            var posPercent = Math.round((posValue / 255) * 100);
            dev['KNX_HVAC_System/act_pos_cool'] = posPercent;
            
            log('Параметр 96 обработан: ' + posValue + ' → ' + posPercent + '%');
            hasData = true;
        }
        
        // Параметр 97 - Скорость вентилятора
        if (dev['Room_2_OUT/FanSpeed_97']) {
            var fanValue = dev['Room_2_OUT/FanSpeed_97'];
            log('Получен параметр 97: ' + fanValue + ' (тип: ' + typeof fanValue + ')');
            
            // Преобразуем значение 0-255 в проценты 0-100%
            var fanPercent = Math.round((fanValue / 255) * 100);
            dev['KNX_HVAC_System/fan_speed'] = fanPercent;
            
            log('Параметр 97 обработан: ' + fanValue + ' → ' + fanPercent + '%');
            hasData = true;
        }
        
        // Параметр 103 - Режим работы HVAC
        if (dev['Room_2_OUT/HVACModeEff_103']) {
            var modeValue = dev['Room_2_OUT/HVACModeEff_103'];
            log('Получен параметр 103: ' + modeValue + ' (тип: ' + typeof modeValue + ')');
            
            // Преобразуем числовое значение в текстовое описание
            var modeText = "Неизвестно";
            switch(parseInt(modeValue)) {
                case 0: modeText = "Auto"; break;
                case 1: modeText = "Comfort"; break;
                case 2: modeText = "Standby"; break;
                case 3: modeText = "Economy"; break;
                case 4: modeText = "Frost protection"; break;
                default: modeText = "Режим " + modeValue;
            }
            
            dev['KNX_HVAC_System/hvac_mode'] = modeText;
            log('Параметр 103 обработан: ' + modeValue + ' → ' + modeText);
            hasData = true;
        }
        
        // Параметр 108 - Температура возвратного воздуха
        if (dev['Room_2_OUT/TReturnAir_108']) {
            var returnTemp = dev['Room_2_OUT/TReturnAir_108'];
            log('Получен параметр 108: ' + returnTemp + ' (тип: ' + typeof returnTemp + ')');
            
            // Температура уже в градусах Цельсия
            dev['KNX_HVAC_System/return_air_temp'] = returnTemp;
            
            log('Параметр 108 обработан: ' + returnTemp + '°C');
            hasData = true;
        }
        
        // === ОБРАБОТКА ПАРАМЕТРОВ РУЧНОГО УПРАВЛЕНИЯ ===
        
        // Параметр 60 - Режим HVAC (ручное управление)
        if (dev['Room_2_IN/HVACModeOptim_60']) {
            var mode60Value = dev['Room_2_IN/HVACModeOptim_60'];
            log('Получен параметр 60: ' + mode60Value + ' (тип: ' + typeof mode60Value + ')');
            
            // Преобразуем числовое значение в текстовое описание
            var mode60Text = "Неизвестно";
            switch(parseInt(mode60Value)) {
                case 0: mode60Text = "Auto"; break;
                case 1: mode60Text = "Comfort"; break;
                case 2: mode60Text = "Standby"; break;
                case 3: mode60Text = "Economy"; break;
                case 4: mode60Text = "Frost protection"; break;
                default: mode60Text = "Режим " + mode60Value;
            }
            
            dev['KNX_HVAC_System/hvac_mode_text'] = mode60Text;
            log('Параметр 60 обработан: ' + mode60Value + ' → ' + mode60Text);
            hasData = true;
        }
        
        // Параметр 74 - Скорость вентилятора (ручное управление)
        if (dev['Room_2_IN/FanSpeedUser_74']) {
            var fan74Value = dev['Room_2_IN/FanSpeedUser_74'];
            log('Получен параметр 74: ' + fan74Value + ' (тип: ' + typeof fan74Value + ')');
            
            // Преобразуем значение в проценты и текстовое описание
            var fan74Percent = Math.round(fan74Value);
            var fan74Text = "Авто";
            
            if (fan74Percent > 0) {
                if (fan74Percent <= 48) {
                    fan74Text = "Низкая (" + fan74Percent + "%)";
                } else if (fan74Percent <= 82) {
                    fan74Text = "Средняя (" + fan74Percent + "%)";
                } else {
                    fan74Text = "Высокая (" + fan74Percent + "%)";
                }
            }
            
            dev['KNX_HVAC_System/fan_speed_text'] = fan74Text;
            log('Параметр 74 обработан: ' + fan74Value + ' → ' + fan74Text);
            hasData = true;
        }
        
        // Обновляем статус
        if (hasData) {
            dev['KNX_HVAC_System/status'] = "Данные обновлены: " + new Date().toLocaleTimeString();
        }
    }
});

// Дополнительное правило для обновления статуса при изменении данных
defineRule({
    when: function() {
        return dev['Room_2_IN/TRSetpSetCool_67'] || dev['Room_2_IN/TRSetpSetCoolSh_69'];
    },
    then: function() {
        dev['KNX_HVAC_System/status'] = "Последнее обновление: " + new Date().toLocaleTimeString();
    }
});

// Правило для автоматического вычисления сдвигов при изменении уставок
defineRule({
    when: function() {
        // Проверяем изменение любого из трех полей уставок
        var comfortChanged = dev['KNX_HVAC_System/set_comfort_temp'];
        var standbyChanged = dev['KNX_HVAC_System/set_standby_temp'];
        var ecoChanged = dev['KNX_HVAC_System/set_eco_temp'];
        
        log('Проверка правила: comfort=' + comfortChanged + ', standby=' + standbyChanged + ', eco=' + ecoChanged);
        
        return comfortChanged || standbyChanged || ecoChanged;
    },
    then: function() {
        log('=== ОБНАРУЖЕНО ИЗМЕНЕНИЕ УСТАВОК ===');
        log('set_comfort_temp: ' + dev['KNX_HVAC_System/set_comfort_temp']);
        log('set_standby_temp: ' + dev['KNX_HVAC_System/set_standby_temp']);
        log('set_eco_temp: ' + dev['KNX_HVAC_System/set_eco_temp']);
        
        dev['KNX_HVAC_System/status'] = "Вычисление сдвигов...";
        
        // Небольшая задержка для стабилизации значений
        setTimeout(function() {
            log('Вызываем calculateAndSendShifts...');
            calculateAndSendShifts();
        }, 1000);
    }
});

// Дополнительное правило для принудительного тестирования
defineRule({
    when: function() {
        return true; // Всегда активно
    },
    then: function() {
        // Проверяем, есть ли данные в базовых уставках
        var baseComfort = dev['KNX_HVAC_System/base_cool_comfort'];
        var baseStandby = dev['KNX_HVAC_System/base_cool_standby'];
        var baseEco = dev['KNX_HVAC_System/base_cool_eco'];
        
        if (baseComfort && baseStandby && baseEco) {
            log('Базовые уставки загружены: Comfort=' + baseComfort + ', Standby=' + baseStandby + ', ECO=' + baseEco);
            
            // Устанавливаем начальные значения для управления, если они не установлены
            if (!dev['KNX_HVAC_System/set_comfort_temp']) {
                dev['KNX_HVAC_System/set_comfort_temp'] = baseComfort;
                log('Установлена начальная уставка Comfort: ' + baseComfort);
            }
            if (!dev['KNX_HVAC_System/set_standby_temp']) {
                dev['KNX_HVAC_System/set_standby_temp'] = baseStandby;
                log('Установлена начальная уставка Standby: ' + baseStandby);
            }
            if (!dev['KNX_HVAC_System/set_eco_temp']) {
                dev['KNX_HVAC_System/set_eco_temp'] = baseEco;
                log('Установлена начальная уставка ECO: ' + baseEco);
            }
        }
    }
});

// Правило для кнопки тестирования
defineRule({
    when: function() {
        return dev['KNX_HVAC_System/test_button'];
    },
    then: function() {
        log('=== НАЖАТА КНОПКА ТЕСТИРОВАНИЯ ===');
        dev['KNX_HVAC_System/status'] = "Тестирование...";
        
        // Сбрасываем кнопку
        dev['KNX_HVAC_System/test_button'] = false;
        
        // Вызываем функцию вычисления сдвигов
        setTimeout(function() {
            log('Вызываем calculateAndSendShifts по кнопке...');
            calculateAndSendShifts();
        }, 500);
    }
});

// Правило для изменения режима HVAC (параметр 60)
defineRule({
    when: function() {
        return dev['KNX_HVAC_System/hvac_mode_manual'];
    },
    then: function() {
        var modeSwitch = dev['KNX_HVAC_System/hvac_mode_manual'];
        log('=== ИЗМЕНЕНИЕ РЕЖИМА HVAC ===');
        log('Переключатель режима: ' + modeSwitch);
        
        if (modeSwitch) {
            // Если включен, устанавливаем режим Comfort (1)
            dev['Room_2_IN/HVACModeOptim_60'] = 1;
            log('Отправлена команда: режим Comfort (1)');
            dev['KNX_HVAC_System/status'] = "Режим Comfort отправлен: " + new Date().toLocaleTimeString();
        } else {
            // Если выключен, возвращаем в Auto (0)
            dev['Room_2_IN/HVACModeOptim_60'] = 0;
            log('Отправлена команда: режим Auto (0)');
            dev['KNX_HVAC_System/status'] = "Режим Auto отправлен: " + new Date().toLocaleTimeString();
        }
    }
});

// Правило для изменения скорости вентилятора (параметр 74)
defineRule({
    when: function() {
        return dev['KNX_HVAC_System/fan_speed_manual'];
    },
    then: function() {
        var fanSpeed = dev['KNX_HVAC_System/fan_speed_manual'];
        log('=== ИЗМЕНЕНИЕ СКОРОСТИ ВЕНТИЛЯТОРА ===');
        log('Новая скорость: ' + fanSpeed + '%');
        
        // Отправляем команду на изменение скорости вентилятора
        dev['Room_2_IN/FanSpeedUser_74'] = fanSpeed;
        log('Отправлена команда: скорость вентилятора ' + fanSpeed + '%');
        dev['KNX_HVAC_System/status'] = "Скорость вентилятора отправлена: " + new Date().toLocaleTimeString();
    }
});

// Тестирование
function testProcessing() {
    log('=== ТЕСТИРОВАНИЕ ОБРАБОТКИ ПАРАМЕТРОВ ===');
    
    var test67 = '0x00 0x0d 0x14 0x0d 0xaa 0x0e 0x40';
    var result67 = processParameter(test67);
    log('Тест 67: ' + test67);
    if (result67) {
        log('  Результат (float): val1=' + result67.val1 + ', val2=' + result67.val2 + ', val3=' + result67.val3);
    }
    
    var test69 = '0x00 0x86 0xd4 0x00 0x00 0x00 0x00';
    var result69 = processParameter(test69);
    log('Тест 69: ' + test69);
    if (result69) {
        log('  Результат (float): val1=' + result69.val1 + ', val2=' + result69.val2 + ', val3=' + result69.val3);
    }
    
    var test105 = '0x00 0x4c 0x0d 0x4c 0x0d 0x4c 0x0d';
    var result105 = processParameter(test105);
    log('Тест 105: ' + test105);
    if (result105) {
        log('  Результат (float): val1=' + result105.val1 + ', val2=' + result105.val2 + ', val3=' + result105.val3);
    }
    
    // Тестируем отдельные функции преобразования
    log('=== СРАВНЕНИЕ МЕТОДОВ ПРЕОБРАЗОВАНИЯ ===');
    
    // Тест для ожидаемых значений
    var test1 = simpleBytesToFloat('0x0d', '0x14');  // Должно быть ~26.00
    var test2 = simpleBytesToFloat('0x0d', '0xaa');  // Должно быть ~29.00  
    var test3 = simpleBytesToFloat('0x0e', '0x40');  // Должно быть ~32.00
    
    log('0x0d 0x14 (ожидается ~26.00): ' + test1);
    log('0x0d 0xaa (ожидается ~29.00): ' + test2);
    log('0x0e 0x40 (ожидается ~32.00): ' + test3);
    
    // Тест для параметра 69
    var test69_1 = simpleBytesToFloat('0x86', '0xd4');
    log('0x86 0xd4 (параметр 69): ' + test69_1);
    
    // Тест для параметра 105
    var test105_1 = simpleBytesToFloat('0x4c', '0x0d');
    log('0x4c 0x0d (параметр 105): ' + test105_1);
    
    // Тестируем функцию valueToKnxBytes
    log('=== ТЕСТИРОВАНИЕ valueToKnxBytes ===');
    var testBytes1 = valueToKnxBytes(1.0);  // Сдвиг +1K
    var testBytes2 = valueToKnxBytes(-1.0); // Сдвиг -1K
    var testBytes3 = valueToKnxBytes(0.0);  // Сдвиг 0K
    
    if (testBytes1) log('Тест +1K: ' + testBytes1.byte1 + ' ' + testBytes1.byte2);
    if (testBytes2) log('Тест -1K: ' + testBytes2.byte1 + ' ' + testBytes2.byte2);
    if (testBytes3) log('Тест 0K: ' + testBytes3.byte1 + ' ' + testBytes3.byte2);
    
    // Тестируем функцию calculateAndSendShifts
    log('=== ТЕСТИРОВАНИЕ calculateAndSendShifts ===');
    log('Вызываем функцию calculateAndSendShifts...');
    calculateAndSendShifts();
    
    // Тестируем дополнительные параметры
    log('=== ТЕСТИРОВАНИЕ ДОПОЛНИТЕЛЬНЫХ ПАРАМЕТРОВ ===');
    
    // Тест параметра 96 (позиция клапана)
    var testPos96 = 255;
    var testPosPercent = Math.round((testPos96 / 255) * 100);
    log('Тест параметра 96: ' + testPos96 + ' → ' + testPosPercent + '%');
    
    // Тест параметра 97 (скорость вентилятора)
    var testFan97 = 84;
    var testFanPercent = Math.round((testFan97 / 255) * 100);
    log('Тест параметра 97: ' + testFan97 + ' → ' + testFanPercent + '%');
    
    // Тест параметра 103 (режим HVAC)
    var testMode103 = 4;
    var testModeText = "Frost protection";
    log('Тест параметра 103: ' + testMode103 + ' → ' + testModeText);
    
    // Тест параметра 108 (температура возвратного воздуха)
    var testReturn108 = 25.6;
    log('Тест параметра 108: ' + testReturn108 + '°C');
    
    // Тестируем параметры ручного управления
    log('=== ТЕСТИРОВАНИЕ ПАРАМЕТРОВ РУЧНОГО УПРАВЛЕНИЯ ===');
    
    // Тест параметра 60 (режим HVAC)
    var testMode60 = 1;
    var testMode60Text = "Comfort";
    log('Тест параметра 60: ' + testMode60 + ' → ' + testMode60Text);
    
    // Тест параметра 74 (скорость вентилятора)
    var testFan74 = 66;
    var testFan74Text = "Средняя (66%)";
    log('Тест параметра 74: ' + testFan74 + ' → ' + testFan74Text);
    
    // Обновляем виртуальное устройство тестовыми данными
    if (result67 !== null) {
        dev['KNX_HVAC_System/base_cool_comfort'] = result67.val1;
        dev['KNX_HVAC_System/base_cool_standby'] = result67.val2;
        dev['KNX_HVAC_System/base_cool_eco'] = result67.val3;
    }
    if (result69 !== null) {
        dev['KNX_HVAC_System/shift_cool_comfort'] = result69.val1;
        dev['KNX_HVAC_System/shift_cool_standby'] = result69.val2;
        dev['KNX_HVAC_System/shift_cool_eco'] = result69.val3;
    }
    if (result105 !== null) {
        dev['KNX_HVAC_System/work_cool_comfort'] = result105.val1;
        dev['KNX_HVAC_System/work_cool_standby'] = result105.val2;
        dev['KNX_HVAC_System/work_cool_eco'] = result105.val3;
    }
    dev['KNX_HVAC_System/status'] = "Тест завершен: " + new Date().toLocaleTimeString();
    
    log('=== ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===');
}

testProcessing(); 

// Функция для преобразования числа в KNX байты (обратная функция)
function valueToKnxBytes(value) {
    try {
        log('Преобразуем значение в KNX байты: ' + value);
        
        var floatval = parseFloat(value) * 100;
        log('Умноженное на 100: ' + floatval);
        
        var exp = 1;
        var mant = floatval;
        
        // Ищем подходящую экспоненту
        for (var i = 0; i < 16; i++) {
            exp = Math.pow(2, i);
            mant = floatval / exp;
            log('Попытка ' + i + ': exp=' + exp + ', mant=' + mant);
            
            if (mant >= -2048 && mant <= 2047) {
                log('Найдена подходящая экспонента: ' + i + ', mant=' + mant);
                break;
            }
        }
        
        var sign = 0;
        var mantissa;
        
        if (floatval < 0) {
            sign = 1;
            mantissa = Math.floor(2048 + (floatval / exp));
            log('Отрицательное число: sign=1, mantissa=' + mantissa);
        } else {
            sign = 0;
            mantissa = Math.floor(floatval / exp);
            log('Положительное число: sign=0, mantissa=' + mantissa);
        }
        
        var byte1 = ((sign << 7) | (i << 3) | (mantissa >> 8)) & 0xFF;
        var byte2 = mantissa & 0xFF;
        
        log('Результат: byte1=' + byte1 + ' (0x' + byte1.toString(16) + '), byte2=' + byte2 + ' (0x' + byte2.toString(16) + ')');
        
        // Формируем hex строки без padStart
        var hex1 = '0x' + (byte1 < 16 ? '0' : '') + byte1.toString(16);
        var hex2 = '0x' + (byte2 < 16 ? '0' : '') + byte2.toString(16);
        
        log('Hex строки: ' + hex1 + ', ' + hex2);
        
        return {
            byte1: hex1,
            byte2: hex2
        };
    } catch (error) {
        log('Ошибка при преобразовании в KNX байты: ' + error);
        return null;
    }
}

// Функция для формирования hex строки из 6 байтов
function createHexString(bytes1, bytes2, bytes3) {
    if (!bytes1 || !bytes2 || !bytes3) {
        return null;
    }
    
    // Формируем строку: 0x00 + 6 байтов
    var hexString = '0x00 ' + bytes1.byte1 + ' ' + bytes1.byte2 + ' ' + 
                    bytes2.byte1 + ' ' + bytes2.byte2 + ' ' + 
                    bytes3.byte1 + ' ' + bytes3.byte2;
    
    return hexString;
}

// Функция для вычисления сдвигов и отправки команд
function calculateAndSendShifts() {
    try {
        // Получаем заданные температуры
        var comfortTemp = dev['KNX_HVAC_System/set_comfort_temp'];
        var standbyTemp = dev['KNX_HVAC_System/set_standby_temp'];
        var ecoTemp = dev['KNX_HVAC_System/set_eco_temp'];
        
        // Получаем базовые уставки
        var baseComfort = dev['KNX_HVAC_System/base_cool_comfort'];
        var baseStandby = dev['KNX_HVAC_System/base_cool_standby'];
        var baseEco = dev['KNX_HVAC_System/base_cool_eco'];
        
        if (!baseComfort || !baseStandby || !baseEco) {
            log('Ошибка: базовые уставки не загружены');
            return;
        }
        
        // Вычисляем сдвиги (в Кельвинах)
        var shiftComfort = comfortTemp - baseComfort;
        var shiftStandby = standbyTemp - baseStandby;
        var shiftEco = ecoTemp - baseEco;
        
        log('Вычисленные сдвиги: Comfort=' + shiftComfort + 'K, Standby=' + shiftStandby + 'K, ECO=' + shiftEco + 'K');
        
        // Преобразуем сдвиги в KNX байты
        var bytesComfort = valueToKnxBytes(shiftComfort);
        var bytesStandby = valueToKnxBytes(shiftStandby);
        var bytesEco = valueToKnxBytes(shiftEco);
        
        if (!bytesComfort || !bytesStandby || !bytesEco) {
            log('Ошибка: не удалось преобразовать сдвиги в байты');
            return;
        }
        
        // Формируем hex строку для параметра 69
        var hexString69 = createHexString(bytesComfort, bytesStandby, bytesEco);
        
        if (hexString69) {
            log('Сформирована hex строка для параметра 69: ' + hexString69);
            
            // Отправляем команду на изменение параметра 69
            dev['Room_2_IN/TRSetpSetCoolSh_69'] = hexString69;
            
            // Обновляем статус
            dev['KNX_HVAC_System/status'] = "Сдвиги отправлены: " + new Date().toLocaleTimeString();
            
            log('Команда на изменение параметра 69 отправлена');
        }
        
    } catch (error) {
        log('Ошибка при вычислении сдвигов: ' + error);
        dev['KNX_HVAC_System/status'] = "Ошибка: " + error;
    }
} 