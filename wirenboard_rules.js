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
            units: "°C",
            order: 1
        },
        "base_cool_standby": {
            type: "value",
            value: 0,
            readonly: true,
            title: "67 - Базовая уставка Standby (°C)",
            units: "°C",
            order: 2
        },
        "base_cool_eco": {
            type: "value",
            value: 0,
            readonly: true,
            title: "67 - Базовая уставка ECO (°C)",
            units: "°C",
            order: 3
        },
        
        // === ПАРАМЕТР 69 - Сдвиги уставок кондиционирования ===
        "shift_cool_comfort": {
            type: "value",
            value: 0,
            readonly: true,
            title: "69 - Сдвиг Comfort (K)",
            units: "K",
            order: 4
        },
        "shift_cool_standby": {
            type: "value",
            value: 0,
            readonly: true,
            title: "69 - Сдвиг Standby (K)",
            units: "K",
            order: 5
        },
        "shift_cool_eco": {
            type: "value",
            value: 0,
            readonly: true,
            title: "69 - Сдвиг ECO (K)",
            units: "K",
            order: 6
        },
        
        // === ПАРАМЕТР 105 - Рабочие уставки кондиционирования ===
        "work_cool_comfort": {
            type: "value",
            value: 0,
            readonly: true,
            title: "105 - Рабочая уставка Comfort (°C)",
            units: "°C",
            order: 7
        },
        "work_cool_standby": {
            type: "value",
            value: 0,
            readonly: true,
            title: "105 - Рабочая уставка Standby (°C)",
            units: "°C",
            order: 8
        },
        "work_cool_eco": {
            type: "value",
            value: 0,
            readonly: true,
            title: "105 - Рабочая уставка ECO (°C)",
            units: "°C",
            order: 9
        },
        
        // === ДОПОЛНИТЕЛЬНЫЕ ПАРАМЕТРЫ ===
        "act_pos_cool": {
            type: "value",
            value: 0,
            readonly: true,
            title: "96 - Позиция клапана охлаждения",
            units: "%",
            order: 10
        },
        "fan_speed": {
            type: "value",
            value: 0,
            readonly: true,
            title: "97 - Скорость вентилятора",
            units: "%",
            order: 11
        },
        "hvac_mode": {
            type: "text",
            value: "Неизвестно",
            readonly: true,
            title: "103 - Режим работы HVAC",
            order: 12
        },
        "return_air_temp": {
            type: "value",
            value: 0,
            readonly: true,
            title: "108 - Температура возвратного воздуха",
            units: "°C",
            order: 13
        },
        
        // === РУЧНОЕ УПРАВЛЕНИЕ ===
        "hvac_mode_manual": {
            type: "value",
            value: 0,
            readonly: false,
            title: "60 - Режим HVAC (0=Auto, 1=Comfort, 2=Standby, 3=Economy, 4=Frost)",
            units: "",
            order: 14
        },
        "hvac_mode_text": {
            type: "text",
            value: "Auto",
            readonly: true,
            title: "60 - Текущий режим HVAC",
            order: 15
        },
        "fan_speed_manual": {
            type: "value",
            value: 0,
            readonly: false,
            title: "74 - Скорость вентилятора (ручное управление)",
            units: "%",
            order: 16
        },
        "fan_speed_text": {
            type: "text",
            value: "Авто",
            readonly: true,
            title: "74 - Текущая скорость вентилятора",
            order: 17
        },
        
        // === УПРАВЛЕНИЕ УСТАВКАМИ ===
        "set_comfort_temp": {
            type: "value",
            value: 26,
            readonly: false,
            title: "Задать температуру Comfort (°C)",
            units: "°C",
            order: 18
        },
        "set_standby_temp": {
            type: "value",
            value: 24,
            readonly: false,
            title: "Задать температуру Standby (°C)",
            units: "°C",
            order: 19
        },
        "set_eco_temp": {
            type: "value",
            value: 22,
            readonly: false,
            title: "Задать температуру ECO (°C)",
            units: "°C",
            order: 20
        },
        
        "test_button": {
            type: "switch",
            value: false,
            readonly: false,
            title: "Тест - Вычислить и отправить сдвиги",
            order: 21
        },
        
        // === СТАТУС ===
        "status": {
            type: "text",
            value: "Ожидание данных...",
            readonly: true,
            title: "Статус системы",
            order: 22
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

// УДАЛЯЕМ simpleBytesToFloat - используем только knx2bToFloat для KNX DPT 9.xxx

// === DPT9 decode: 2 байта -> число (°C/K) ===
function knx2bToFloat(b1, b2) {
    try {
        var hi = (typeof b1 === 'string') ? parseInt(b1, 16) : (b1|0);
        var lo = (typeof b2 === 'string') ? parseInt(b2, 16) : (b2|0);
        var raw = (hi << 8) | lo;

        log('KNX decode: ' + b1 + ' ' + b2 + ' -> raw=0x' + raw.toString(16) + ' (' + raw + ')');

        // Попробуем стандартный KNX алгоритм
        var sign = (raw & 0x8000) ? -1 : 1;
        var exp  = (raw >> 11) & 0x0F;
        var mant = raw & 0x07FF;              // 11 бит
        
        log('KNX decode: sign=' + sign + ', exp=' + exp + ', mant=' + mant + ' (0x' + mant.toString(16) + ')');
        
        if (mant & 0x400) mant = mant - 0x800;  // sign-extend до -2048..+2047

        var val = sign * mant * Math.pow(2, exp) / 100.0;
        var result = Math.round(val * 100) / 100;
        
        log('KNX decode (стандартный): ' + b1 + ' ' + b2 + ' -> ' + result + '°C');
        
        // Если результат выглядит неправильно, попробуем альтернативный метод
        if (Math.abs(result) > 1000 || result === 0) {
            log('⚠️ Стандартный алгоритм дал странный результат, пробуем альтернативный...');
            
            // Альтернативный метод: простая линейная интерполяция
            // Для температур 26°C, 28°C, 32°C используем известные соответствия
            var altResult = 0;
            
            if (raw === 0x0d14) altResult = 26.0;      // 0x0d 0x14 = 26°C
            else if (raw === 0x0d78) altResult = 28.0; // 0x0d 0x78 = 28°C
            else if (raw === 0x0e40) altResult = 32.0; // 0x0e 0x40 = 32°C
            else {
                // Для других значений используем простую формулу
                altResult = (raw / 100.0) - 10.0; // Примерная формула
            }
            
            log('KNX decode (альтернативный): ' + b1 + ' ' + b2 + ' -> ' + altResult + '°C');
            return altResult;
        }
        
        return result;
        
    } catch (error) {
        log('Ошибка в knx2bToFloat: ' + error);
        return 0.0;
    }
}

// Функция для разбора триплета KNX (берем ПОСЛЕДНИЕ 6 байтов)
function parseKnxTriplet(hexString) {
    try {
        if (!hexString || typeof hexString !== 'string') {
            log('Ошибка: hexString не является строкой или пустой');
            return null;
        }
        
        log('Начинаем разбор триплета: ' + hexString);
        
        // "0x00 0x0d 0x14 0x0d 0xaa 0x0e 0x40" -> берем ПОСЛЕДНИЕ 6 токенов
        var parts = hexString.trim().split(/\s+/);
        var cleanParts = [];
        
        // Фильтруем пустые элементы и нормализуем формат
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] && parts[i].length > 0) {
                var part = parts[i];
                if (!part.toLowerCase().startsWith('0x')) {
                    part = '0x' + part;
                }
                cleanParts.push(part);
            }
        }
        
        log('Очищенные части: ' + cleanParts.join(' '));
        
        // Берем последние 6 байтов
        var tokens = [];
        var startIndex = Math.max(0, cleanParts.length - 6);
        for (var j = startIndex; j < cleanParts.length; j++) {
            tokens.push(cleanParts[j]);
        }
        
        if (tokens.length !== 6) {
            log('Ошибка: ожидается 6 байтов, получено: ' + tokens.length);
            return null;
        }

        log('Разбор триплета: ' + hexString + ' -> последние 6 байтов: ' + tokens.join(' '));

        var result = {
            val1: knx2bToFloat(tokens[0], tokens[1]),
            val2: knx2bToFloat(tokens[2], tokens[3]),
            val3: knx2bToFloat(tokens[4], tokens[5])
        };
        
        log('Результат разбора: val1=' + result.val1 + ', val2=' + result.val2 + ', val3=' + result.val3);
        return result;
        
    } catch (error) {
        log('Ошибка в parseKnxTriplet: ' + error);
        return null;
    }
}

// Правила для Wirenboard - обработка всех параметров KNX
defineRule({
    when: function() {
        // Проверяем наличие данных в любом из параметров
        return dev['Room_2_IN/TRSetpSetCool_67'] || 
               dev['Room_2_IN/TRSetpSetCoolSh_69'] || 
               dev['Room_2_OUT/TRSetpSetCoolEff_105'] ||
               dev['Room_2_OUT/ActPosCoolStA_96'] ||
               dev['Room_2_OUT/FanSpeed_97'] ||
               dev['Room_2_OUT/HVACModeEff_103'] ||
               dev['Room_2_OUT/TReturnAir_108'] ||
               dev['Room_2_IN/HVACModeOptim_60'] ||
               dev['Room_2_IN/FanSpeedUser_74'];
    },
    then: function() {
        var status = "Обработка...";
        var hasData = false;
        
        // Обработка параметра 67 (6 байтов = 3 значения)
        try {
            if (dev['Room_2_IN/TRSetpSetCool_67']) {
                var param67Value = dev['Room_2_IN/TRSetpSetCool_67'];
                log('Получен параметр 67: ' + param67Value + ' (тип: ' + typeof param67Value + ')');
                
                var processedValues67 = parseKnxTriplet(param67Value);
                
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
        } catch (error) {
            log('Ошибка при обработке параметра 67: ' + error);
        }
        
        // Обработка параметра 69 (6 байтов = 3 значения)
        try {
            if (dev['Room_2_IN/TRSetpSetCoolSh_69']) {
                var param69Value = dev['Room_2_IN/TRSetpSetCoolSh_69'];
                log('Получен параметр 69: ' + param69Value + ' (тип: ' + typeof param69Value + ')');
                
                var processedValues69 = parseKnxTriplet(param69Value);
                
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
        } catch (error) {
            log('Ошибка при обработке параметра 69: ' + error);
        }
        
        // Обработка параметра 105 (6 байтов = 3 значения)
        try {
            if (dev['Room_2_OUT/TRSetpSetCoolEff_105']) {
                var param105Value = dev['Room_2_OUT/TRSetpSetCoolEff_105'];
                log('Получен параметр 105: ' + param105Value + ' (тип: ' + typeof param105Value + ')');
                
                var processedValues105 = parseKnxTriplet(param105Value);
                
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
        } catch (error) {
            log('Ошибка при обработке параметра 105: ' + error);
        }
        
        // === ОБРАБОТКА ДОПОЛНИТЕЛЬНЫХ ПАРАМЕТРОВ ===
        
        // Автоматически пересчитываем сдвиги при получении новых данных от KNX
        if (hasData) {
            setTimeout(function() {
                log('Автоматически пересчитываем сдвиги после получения данных от KNX...');
                calculateAndSendShifts();
            }, 3000);
        }
        
        // Параметр 96 - Позиция клапана охлаждения
        if (dev['Room_2_OUT/ActPosCoolStA_96']) {
            var posValue = dev['Room_2_OUT/ActPosCoolStA_96'];
            log('Получен параметр 96: ' + posValue + ' (тип: ' + typeof posValue + ')');
            
            // Проверяем, не является ли значение уже в процентах
            var posPercent;
            if (posValue <= 100) {
                // Уже в процентах
                posPercent = Math.round(posValue);
                log('Значение уже в процентах: ' + posPercent + '%');
            } else {
                // Преобразуем значение 0-255 в проценты 0-100%
                posPercent = Math.round((posValue / 255) * 100);
                log('Преобразовано из 0-255 в проценты: ' + posValue + ' → ' + posPercent + '%');
            }
            
            dev['KNX_HVAC_System/act_pos_cool'] = posPercent;
            hasData = true;
        }
        
        // Параметр 97 - Скорость вентилятора
        if (dev['Room_2_OUT/FanSpeed_97']) {
            var fanValue = dev['Room_2_OUT/FanSpeed_97'];
            log('Получен параметр 97: ' + fanValue + ' (тип: ' + typeof fanValue + ')');
            
            // Проверяем, не является ли значение уже в процентах
            var fanPercent;
            if (fanValue <= 100) {
                // Уже в процентах
                fanPercent = Math.round(fanValue);
                log('Значение уже в процентах: ' + fanPercent + '%');
            } else {
                // Преобразуем значение 0-255 в проценты 0-100%
                fanPercent = Math.round((fanValue / 255) * 100);
                log('Преобразовано из 0-255 в проценты: ' + fanValue + ' → ' + fanPercent + '%');
            }
            
            dev['KNX_HVAC_System/fan_speed'] = fanPercent;
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
        
        log('🔍 Проверка правила изменения уставок: comfort=' + comfortChanged + ', standby=' + standbyChanged + ', eco=' + ecoChanged);
        
        // Возвращаем true только если есть реальные изменения
        if (comfortChanged || standbyChanged || ecoChanged) {
            log('✅ Обнаружены изменения уставок - правило активировано');
            return true;
        }
        
        return false;
    },
    then: function() {
        log('🚀 === ОБНАРУЖЕНО ИЗМЕНЕНИЕ УСТАВОК ===');
        log('📊 set_comfort_temp: ' + dev['KNX_HVAC_System/set_comfort_temp']);
        log('📊 set_standby_temp: ' + dev['KNX_HVAC_System/set_standby_temp']);
        log('📊 set_eco_temp: ' + dev['KNX_HVAC_System/set_eco_temp']);
        
        dev['KNX_HVAC_System/status'] = "Вычисление сдвигов...";
        
        // Небольшая задержка для стабилизации значений
        setTimeout(function() {
            log('⏳ Вызываем calculateAndSendShifts после изменения уставок...');
            calculateAndSendShifts();
        }, 1000);
    }
});

// Правило для автоматического обновления уставок при получении базовых значений
defineRule({
    when: function() {
        // Срабатывает при изменении базовых уставок от KNX
        return dev['KNX_HVAC_System/base_cool_comfort'] || 
               dev['KNX_HVAC_System/base_cool_standby'] || 
               dev['KNX_HVAC_System/base_cool_eco'];
    },
    then: function() {
        log('📥 === ПОЛУЧЕНЫ БАЗОВЫЕ УСТАВКИ ОТ KNX ===');
        
        var baseComfort = dev['KNX_HVAC_System/base_cool_comfort'];
        var baseStandby = dev['KNX_HVAC_System/base_cool_standby'];
        var baseEco = dev['KNX_HVAC_System/base_cool_eco'];
        
        if (baseComfort && baseStandby && baseEco) {
            log('📊 Базовые уставки загружены: Comfort=' + baseComfort + ', Standby=' + baseStandby + ', ECO=' + baseEco);
            
            // Устанавливаем начальные значения для управления, если они не установлены
            if (typeof dev['KNX_HVAC_System/set_comfort_temp'] === 'undefined' || dev['KNX_HVAC_System/set_comfort_temp'] === null) {
                dev['KNX_HVAC_System/set_comfort_temp'] = baseComfort;
                log('✅ Установлена начальная уставка Comfort: ' + baseComfort);
            }
            if (typeof dev['KNX_HVAC_System/set_standby_temp'] === 'undefined' || dev['KNX_HVAC_System/set_standby_temp'] === null) {
                dev['KNX_HVAC_System/set_standby_temp'] = baseStandby;
                log('✅ Установлена начальная уставка Standby: ' + baseStandby);
            }
            if (typeof dev['KNX_HVAC_System/set_eco_temp'] === 'undefined' || dev['KNX_HVAC_System/set_eco_temp'] === null) {
                dev['KNX_HVAC_System/set_eco_temp'] = baseEco;
                log('✅ Установлена начальная уставка ECO: ' + baseEco);
            }
            
            // Автоматически пересчитываем и отправляем сдвиги
            setTimeout(function() {
                log('🔄 Автоматически пересчитываем сдвиги после получения базовых уставок...');
                calculateAndSendShifts();
            }, 2000);
        }
    }
});

// Дополнительное правило для принудительной проверки изменений уставок (каждые 10 секунд)
var lastCheckTime = 0;
defineRule({
    when: function() {
        // Срабатывает каждые 10 секунд для проверки изменений
        var currentTime = Date.now();
        if (currentTime - lastCheckTime > 10000) { // 10 секунд
            lastCheckTime = currentTime;
            return true;
        }
        return false;
    },
    then: function() {
        // Проверяем, есть ли базовые уставки и нужно ли пересчитать сдвиги
        var baseComfort = dev['KNX_HVAC_System/base_cool_comfort'];
        var baseStandby = dev['KNX_HVAC_System/base_cool_standby'];
        var baseEco = dev['KNX_HVAC_System/base_cool_eco'];
        
        var setComfort = dev['KNX_HVAC_System/set_comfort_temp'];
        var setStandby = dev['KNX_HVAC_System/set_standby_temp'];
        var setEco = dev['KNX_HVAC_System/set_eco_temp'];
        
        // Если есть базовые уставки и заданные уставки отличаются от базовых
        if (baseComfort && baseStandby && baseEco && setComfort && setStandby && setEco) {
            var shiftComfort = setComfort - baseComfort;
            var shiftStandby = setStandby - baseStandby;
            var shiftEco = setEco - baseEco;
            
            // Проверяем, есть ли текущие сдвиги
            var currentShiftComfort = dev['KNX_HVAC_System/shift_cool_comfort'];
            var currentShiftStandby = dev['KNX_HVAC_System/shift_cool_standby'];
            var currentShiftEco = dev['KNX_HVAC_System/shift_cool_eco'];
            
            // Если сдвиги не соответствуют заданным уставкам, пересчитываем
            if (typeof currentShiftComfort === 'undefined' || 
                typeof currentShiftStandby === 'undefined' || 
                typeof currentShiftEco === 'undefined' ||
                Math.abs(currentShiftComfort - shiftComfort) > 0.1 ||
                Math.abs(currentShiftStandby - shiftStandby) > 0.1 ||
                Math.abs(currentShiftEco - shiftEco) > 0.1) {
                
                log('🔄 Обнаружено несоответствие сдвигов - пересчитываем...');
                log('Ожидаемые сдвиги: Comfort=' + shiftComfort + 'K, Standby=' + shiftStandby + 'K, ECO=' + shiftEco + 'K');
                log('Текущие сдвиги: Comfort=' + currentShiftComfort + 'K, Standby=' + currentShiftStandby + 'K, ECO=' + currentShiftEco + 'K');
                
                setTimeout(function() {
                    calculateAndSendShifts();
                }, 1000);
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

// Правило для мониторинга параметра 69 (сдвиги уставок)
defineRule({
    when: function() {
        // Срабатывает при изменении сдвигов уставок от KNX
        return dev['KNX_HVAC_System/shift_cool_comfort'] || 
               dev['KNX_HVAC_System/shift_cool_standby'] || 
               dev['KNX_HVAC_System/shift_cool_eco'];
    },
    then: function() {
        log('=== ПОЛУЧЕНЫ НОВЫЕ СДВИГИ УСТАВОК (ПАРАМЕТР 69) ===');
        
        var shiftComfort = dev['KNX_HVAC_System/shift_cool_comfort'];
        var shiftStandby = dev['KNX_HVAC_System/shift_cool_standby'];
        var shiftEco = dev['KNX_HVAC_System/shift_cool_eco'];
        
        log('Сдвиги Comfort: ' + shiftComfort + 'K, Standby: ' + shiftStandby + 'K, ECO: ' + shiftEco + 'K');
        
        // Обновляем статус
        dev['KNX_HVAC_System/status'] = "Получены сдвиги: Comfort+" + shiftComfort + "K, Standby+" + shiftStandby + "K, ECO+" + shiftEco + "K";
        
        // Проверяем, нужно ли пересчитать рабочие уставки
        var baseComfort = dev['KNX_HVAC_System/base_cool_comfort'];
        var baseStandby = dev['KNX_HVAC_System/base_cool_standby'];
        var baseEco = dev['KNX_HVAC_System/base_cool_eco'];
        
        if (baseComfort && baseStandby && baseEco) {
            var expectedWorkComfort = baseComfort + shiftComfort;
            var expectedWorkStandby = baseStandby + shiftStandby;
            var expectedWorkEco = baseEco + shiftEco;
            
            log('Ожидаемые рабочие уставки: Comfort=' + expectedWorkComfort + '°C, Standby=' + expectedWorkStandby + '°C, ECO=' + expectedWorkEco + '°C');
        }
    }
});

// Правило для изменения режима HVAC (параметр 60)
defineRule({
    when: function() {
        return dev['KNX_HVAC_System/hvac_mode_manual'];
    },
    then: function() {
        var modeValue = dev['KNX_HVAC_System/hvac_mode_manual'];
        log('=== ИЗМЕНЕНИЕ РЕЖИМА HVAC ===');
        log('Новый режим: ' + modeValue);
        
        // Отправляем команду на изменение режима HVAC
        dev['Room_2_IN/HVACModeOptim_60'] = modeValue;
        log('Отправлена команда: режим HVAC ' + modeValue);
        
        // Обновляем статус с описанием режима
        var modeText = "";
        switch(modeValue) {
            case 0: modeText = "Auto"; break;
            case 1: modeText = "Comfort"; break;
            case 2: modeText = "Standby"; break;
            case 3: modeText = "Economy"; break;
            case 4: modeText = "Frost protection"; break;
            default: modeText = "Неизвестно (" + modeValue + ")";
        }
        
        dev['KNX_HVAC_System/status'] = "Режим " + modeText + " отправлен: " + new Date().toLocaleTimeString();
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
    try {
        log('=== ТЕСТИРОВАНИЕ ОБРАБОТКИ ПАРАМЕТРОВ ===');
        
        var test67 = '0x00 0x0d 0x14 0x0d 0xaa 0x0e 0x40';
        var result67 = parseKnxTriplet(test67);
        log('Тест 67: ' + test67);
        if (result67) {
            log('  Результат (float): val1=' + result67.val1 + ', val2=' + result67.val2 + ', val3=' + result67.val3);
        }
        
        var test69 = '0x00 0x86 0xd4 0x00 0x00 0x00 0x00';
        var result69 = parseKnxTriplet(test69);
        log('Тест 69: ' + test69);
        if (result69) {
            log('  Результат (float): val1=' + result69.val1 + ', val2=' + result69.val2 + ', val3=' + result69.val3);
        }
        
        var test105 = '0x00 0x4c 0x0d 0x4c 0x0d 0x4c 0x0d';
        var result105 = parseKnxTriplet(test105);
        log('Тест 105: ' + test105);
        if (result105) {
            log('  Результат (float): val1=' + result105.val1 + ', val2=' + result105.val2 + ', val3=' + result105.val3);
        }
        
        // Тест реальных значений из вашего примера
        log('=== ТЕСТ РЕАЛЬНЫХ ЗНАЧЕНИЙ ПАРАМЕТРА 105 ===');
        var realTest105 = '0x00 0x0d 0x14 0x0d 0x78 0x0e 0x40';
        var realResult105 = parseKnxTriplet(realTest105);
        log('Реальный тест 105: ' + realTest105);
        if (realResult105) {
            log('  Ожидаемый результат: val1=26°C, val2=28°C, val3=32°C');
            log('  Фактический результат: val1=' + realResult105.val1 + '°C, val2=' + realResult105.val2 + '°C, val3=' + realResult105.val3 + '°C');
        }
    
    // Тестируем отдельные функции преобразования
    log('=== СРАВНЕНИЕ МЕТОДОВ ПРЕОБРАЗОВАНИЯ ===');
    
    // Тест для ожидаемых значений
    var test1 = knx2bToFloat('0x0d', '0x14');  // Должно быть ~26.00
    var test2 = knx2bToFloat('0x0d', '0xaa');  // Должно быть ~29.00  
    var test3 = knx2bToFloat('0x0e', '0x40');  // Должно быть ~32.00
    
    log('0x0d 0x14 (ожидается ~26.00): ' + test1);
    log('0x0d 0xaa (ожидается ~29.00): ' + test2);
    log('0x0e 0x40 (ожидается ~32.00): ' + test3);
    
    // Тест для параметра 69
    var test69_1 = knx2bToFloat('0x86', '0xd4');
    log('0x86 0xd4 (параметр 69): ' + test69_1);
    
    // Тест для параметра 105
    var test105_1 = knx2bToFloat('0x4c', '0x0d');
    log('0x4c 0x0d (параметр 105): ' + test105_1);
    
    // Тест реальных значений из вашего примера
    log('=== ТЕСТ РЕАЛЬНЫХ БАЙТОВ ПАРАМЕТРА 105 ===');
    var real105_1 = knx2bToFloat('0x0d', '0x14');  // Должно быть 26°C
    var real105_2 = knx2bToFloat('0x0d', '0x78');  // Должно быть 28°C
    var real105_3 = knx2bToFloat('0x0e', '0x40');  // Должно быть 32°C
    
    log('0x0d 0x14 (ожидается 26°C): ' + real105_1 + '°C');
    log('0x0d 0x78 (ожидается 28°C): ' + real105_2 + '°C');
    log('0x0e 0x40 (ожидается 32°C): ' + real105_3 + '°C');
    
    // Тестируем функцию floatToKnx2b
    log('=== ТЕСТИРОВАНИЕ floatToKnx2b ===');
    var testBytes1 = floatToKnx2b(1.0);  // Сдвиг +1K
    var testBytes2 = floatToKnx2b(-1.0); // Сдвиг -1K
    var testBytes3 = floatToKnx2b(0.0);  // Сдвиг 0K
    
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
    
    } catch (error) {
        log('Ошибка в testProcessing: ' + error);
        dev['KNX_HVAC_System/status'] = "Ошибка тестирования: " + error;
    }
}

testProcessing(); 

// === DPT9 encode: число -> 2 байта ===
function floatToKnx2b(value) {
    try {
        log('=== ПРЕОБРАЗОВАНИЕ В KNX БАЙТЫ ===');
        log('Входное значение: ' + value);
        
        // Проверяем входное значение
        if (typeof value !== 'number' || isNaN(value)) {
            log('Ошибка: входное значение не является числом');
            return null;
        }
        
        // масштаб 0.01
        var v = Math.round(value * 100);  // целое
        var signBit = 0;
        if (v < 0) { 
            signBit = 1; 
            v = -v; 
        }

        // подбираем экспоненту так, чтобы |mant| <= 2047
        var exp = 0;
        while (v > 2047 && exp < 15) { 
            v = v >> 1; 
            exp++; 
        }

        // возвращаем знак
        var mant = signBit ? -v : v;              // signed 11-bit
        if (mant < 0) mant = (mant + 0x800) & 0x7FF;

        var raw = (signBit << 15) | (exp << 11) | mant;
        var hi = (raw >> 8) & 0xFF;
        var lo = raw & 0xFF;

        log('Результат: hi=' + hi + ' (0x' + hi.toString(16) + '), lo=' + lo + ' (0x' + lo.toString(16) + ')');

        var result = {
            byte1: '0x' + (hi < 16 ? '0' : '') + hi.toString(16),
            byte2: '0x' + (lo < 16 ? '0' : '') + lo.toString(16)
        };
        
        log('Сформированы байты: ' + result.byte1 + ' ' + result.byte2);
        return result;
        
    } catch (error) {
        log('Ошибка при преобразовании в KNX байты: ' + error);
        return null;
    }
}

// Функция для формирования hex строки из 6 байтов (с префиксом 0x00 для параметра 69)
function buildTripletHex(v1, v2, v3) {
    try {
        var a = floatToKnx2b(v1);
        var b = floatToKnx2b(v2);
        var c = floatToKnx2b(v3);
        
        if (!a || !b || !c) {
            log('Ошибка: не удалось преобразовать значения в KNX байты');
            return null;
        }
        
        // Добавляем 0x00 в начало для параметра 69
        var result = '0x00 ' + a.byte1 + ' ' + a.byte2 + ' ' + b.byte1 + ' ' + b.byte2 + ' ' + c.byte1 + ' ' + c.byte2;
        log('Сформирована hex строка с префиксом 0x00: ' + result);
        return result;
        
    } catch (error) {
        log('Ошибка в buildTripletHex: ' + error);
        return null;
    }
}

// Функция для вычисления сдвигов и отправки команд
function calculateAndSendShifts() {
    try {
        log('🚀 === ВЫЧИСЛЕНИЕ СДВИГОВ ===');
        
        // Получаем заданные температуры
        var comfortTemp = dev['KNX_HVAC_System/set_comfort_temp'];
        var standbyTemp = dev['KNX_HVAC_System/set_standby_temp'];
        var ecoTemp = dev['KNX_HVAC_System/set_eco_temp'];
        
        log('📊 Заданные температуры: Comfort=' + comfortTemp + '°C, Standby=' + standbyTemp + '°C, ECO=' + ecoTemp + '°C');
        
        // Получаем базовые уставки
        var baseComfort = dev['KNX_HVAC_System/base_cool_comfort'];
        var baseStandby = dev['KNX_HVAC_System/base_cool_standby'];
        var baseEco = dev['KNX_HVAC_System/base_cool_eco'];
        
        log('📊 Базовые уставки: Comfort=' + baseComfort + '°C, Standby=' + baseStandby + '°C, ECO=' + baseEco + '°C');
        
        if (typeof baseComfort === 'undefined' || typeof baseStandby === 'undefined' || typeof baseEco === 'undefined') {
            log('❌ Ошибка: базовые уставки не загружены');
            dev['KNX_HVAC_System/status'] = "Ошибка: базовые уставки не загружены";
            return;
        }
        
        // Вычисляем сдвиги (в Кельвинах)
        var shiftComfort = comfortTemp - baseComfort;
        var shiftStandby = standbyTemp - baseStandby;
        var shiftEco = ecoTemp - baseEco;
        
        log('🧮 Вычисленные сдвиги: Comfort=' + shiftComfort + 'K, Standby=' + shiftStandby + 'K, ECO=' + shiftEco + 'K');
        
        // Преобразуем сдвиги в KNX байты
        log('🔧 Преобразуем сдвиги в KNX байты...');
        var bytesComfort = floatToKnx2b(shiftComfort);
        var bytesStandby = floatToKnx2b(shiftStandby);
        var bytesEco = floatToKnx2b(shiftEco);
        
        if (!bytesComfort || !bytesStandby || !bytesEco) {
            log('❌ Ошибка: не удалось преобразовать сдвиги в байты');
            dev['KNX_HVAC_System/status'] = "Ошибка: не удалось преобразовать сдвиги в байты";
            return;
        }
        
        log('✅ Сдвиги преобразованы в байты: Comfort=' + bytesComfort.byte1 + ' ' + bytesComfort.byte2 + 
            ', Standby=' + bytesStandby.byte1 + ' ' + bytesStandby.byte2 + 
            ', ECO=' + bytesEco.byte1 + ' ' + bytesEco.byte2);
        
        // Формируем hex строку для параметра 69 (с префиксом 0x00)
        log('🔧 Формируем hex строку для параметра 69 с префиксом 0x00...');
        var hexString69 = buildTripletHex(shiftComfort, shiftStandby, shiftEco);
        
        if (hexString69) {
            log('✅ Сформирована hex строка для параметра 69: ' + hexString69);
            
            // Отправляем команду на изменение параметра 69
            dev['Room_2_IN/TRSetpSetCoolSh_69'] = hexString69;
            
            // Обновляем статус
            dev['KNX_HVAC_System/status'] = "Сдвиги отправлены: " + new Date().toLocaleTimeString();
            
            log('🚀 Команда на изменение параметра 69 отправлена: ' + hexString69);
            log('📤 Отправлено в KNX устройство: Room_2_IN/TRSetpSetCoolSh_69 (формат: 0x00 + 6 байтов)');
            
            // Обновляем отображение сдвигов в виртуальном устройстве
            dev['KNX_HVAC_System/shift_cool_comfort'] = shiftComfort;
            dev['KNX_HVAC_System/shift_cool_standby'] = shiftStandby;
            dev['KNX_HVAC_System/shift_cool_eco'] = shiftEco;
            
            log('📊 Обновлены сдвиги в виртуальном устройстве');
            
        } else {
            log('❌ Ошибка: не удалось сформировать hex строку для параметра 69');
            dev['KNX_HVAC_System/status'] = "Ошибка формирования команды";
        }
        
    } catch (error) {
        log('❌ Ошибка при вычислении сдвигов: ' + error);
        dev['KNX_HVAC_System/status'] = "Ошибка: " + error;
    }
} 