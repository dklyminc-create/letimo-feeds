/**
 * LETIMO — фід для Prom.ua, версія 2 (02.10.2026).
 * Джерело: експорт Horoshop «Площадка: Prom (ua+ru)».
 * Різновиди через group_id; «Цвет» → «Колір» (словник Prom) + «Відтінок»;
 * розміри одягу → «Розмір дитячого одягу (за зростом)»; наявність → in_stock + 1 шт.
 * У Prom → Імпорт за посиланням: оновлювати ВСІ поля, автооновлення щодня.
 */
const SRC = 'https://letimo.com.ua/content/export/9aec9cbbb7b577072f1ee03a1e75285a.xml';

const APPLY_COMMISSION = false;
const COMM = {
  1087: 20.11, 1088: 17.42, 1091: 18.61, 1092: 19.36, 1093: 9.63, 1094: 9.76, 1095: 9.63, 1096: 18.61,
  1100: 17.83, 1103: 18.61, 1105: 10.35, 1108: 18.61, 1109: 18.61, 1110: 18.61, 1112: 14.9, 1113: 18.53,
  1115: 18.61, 1116: 18.53, 1117: 17.83, 1120: 9.93, 1122: 19.51, 1124: 18.61, 1126: 19.72, 1127: 19.05,
  1128: 19.59, 1130: 18.61, 1131: 18.61, 1133: 15.1, 1134: 8.93, 1135: 18.61, 1136: 19.36, 1140: 11.38,
  1141: 18.53, 1144: 9.76, 1145: 19.72, 1147: 18.61, 1148: 18.96, 1150: 18.61, 1151: 19.71, 1152: 25,
  1155: 18.96, 1163: 18.61
};
const DEFAULT_COMM = 25;

const CLOTHING = ['1130','1115','1163','1127','1135','1109','1124','1150','1141','1147','1116','1148','1091','1110','1145'];
const SIZE_CHAR = 'Розмір дитячого одягу (за зростом)';

const STOCK_QTY = 1;

// ===== ДОДАТКОВІ ТОВАРИ (не з сайту) — додано 08.10.2026 =====
// 10 товарів (інвертор, бігова доріжка, електроковдри, зарядні станції Oukitel, ДБЖ).
// Їх немає на letimo.com.ua — вони живуть тільки в цьому фіді, щоб автоімпорт Prom їх не знімав.
// Знижки діють до EXTRA_SALE_UNTIL включно, після цього ціна автоматично стає повною.
const EXTRA_SALE_UNTIL = '2026-10-31';
const EXTRA_CATEGORIES_XML = `
<category id="990001">Інвертори</category>
<category id="990003">Електроковдри та електропростирадла</category>
<category id="990004">Зарядні станції</category>
<category id="990005">Джерела безперебійного живлення (ДБЖ)</category>
`;
const EXTRA_OFFERS_XML = `
<offer id="EN-001" available="true">
<price>{{SALE:1099:1199}}</price>
{{OLD:1199}}
<currencyId>UAH</currencyId>
<categoryId>990001</categoryId>
<picture>https://images.prom.ua/7733779503_preobrazovatel-acdc-kc-500d.jpg</picture>
<picture>https://images.prom.ua/7733786383_preobrazovatel-acdc-kc-500d.jpg</picture>
<picture>https://images.prom.ua/7733786419_preobrazovatel-acdc-kc-500d.jpg</picture>
<vendor>UKC</vendor>
<vendorCode>001</vendorCode>
<quantity_in_stock>5</quantity_in_stock>
<name>Преобразователь AC/DC KC-500D 500W+lcd, Инвертор в машину</name>
<name_ua>Перетворювач AC/DC UKC KC-500D 500W 12V-220V з LCD дисплеєм, автомобільний інвертор</name_ua>
<description><![CDATA[<p><strong>Преобразователь AC/DC KC-500D 500W+lcd, Инвертор в машину</strong></p>
<p>UKC 12V-220V 500W можно использовать для зарядки и работы: ноутбуков, видеокамер, телефонов, всей аудио и видеотехники и других электроприборов. Корпус изготовлен из алюминия, с тыльной стороны есть вентилятор для охлаждения. В передней части преобразователя UKC 500W найдите: кнопку вкл/выкл, выход USB с напряжением 5В, розетку. Сверху есть ЖК-дисплей, на котором отображаются вольтаж и другие параметры.</p>]]></description>
<description_ua><![CDATA[<p><strong>Перетворювач AC/DC KC-500D 500W+lcd, Інвертор у машину</strong></p>
<p>UKC 12V-220V 500W можна використовувати для зарядки та роботи: ноутбуків, відеокамер, телефонів, усієї аудіо- та відеотехніки та інших електроприладів. Корпус виготовлений з алюмінію, з тильної сторони є вентилятор для охолодження. У передній частині перетворювача UKC 500W знайдіть: кнопку вкл/викл, вихід USB з напругою 5В, розетку. Зверху є РК-дисплей, на якому відображаються вольтаж та інші параметри.</p>]]></description_ua>
<keywords>преобразователь 12В 220В, инвертор 12В 220В, преобразователь напряжения 12 220, инвертор напряжения 12В 220В, автомобильный инвертор, автомобильный преобразователь напряжения, инвертор в машину, преобразователь в машину, автомобильный инвертор 500Вт, преобразователь 12В 220В 500Вт, инвертор 12В 220В 500Вт, автомобильный преобразователь 500Вт, инвертор 500Вт, преобразователь напряжения 500Вт, инвертор для авто, преобразователь для авто, инвертор 12В 220В с дисплеем, преобразователь 12В 220В LCD, инвертор 500Вт LCD, инвер чистой синусдаи 500Вт, инвертор с чистой синусоидой, преобразователь чистая синусоида, инвертор для автомобильного аккумулятора, преобразователь от аккумулятора 12В, инвертор от аккумулятора 12В 220В, UKC KC-500D, UKC 500D, KC-500D, KC 500D, UKC 500W, UKC инor 500Вт, UKC преобразователь 12 220</keywords>
<keywords_ua>перетворювач 12В 220В, інвертор 12В 220В, перетворювач напруги 12 220, інвертор напруги 12В 220В, автомобільний інвертор, автомобільний перетворювач напруги, інвертор в машину, перетворювач в машину, автомобільний інвертор 500Вт, перетворювач 12В 220В 500Вт, інвертор 12В 220В 500Вт, автомобільний перетворювач 500Вт, інвертор 500 Вт, перетворювач напруги 500 Вт, інвертор для авто, перетворювач для авто, інвертор 12В 220В з дисплеєм, перетворювач 12В 220В LCD, інвертор 500Вт LCD, інвертор чиста синусоїда 500Вт, інвертор з чистою синусоїдою, перетворювач чиста синусоїда, інвертор для автомобільного акумулятора, перетворювач від акумулятора 12В, інвертор від акумулятора 12В 220В, UKC KC-500D, UKC KC 500D, KC-500D, KC 500D, UKC 500W, UKC інвертор 500Вт, UKC перетворювач 12 220</keywords_ua>
<country_of_origin>Китай</country_of_origin>
<param name="Ширина" unit="мм">110</param>
<param name="Довжина" unit="мм">170</param>
<param name="Вага" unit="кг">0.56</param>
<param name="Стан">Новий</param>
<param name="Висота" unit="мм">60</param>
<param name="Особливості">Дисплей, Активное охлаждение (вентилятор)</param>
<param name="Колір корпусу">Чорний</param>
<param name="Захист від перегріву">Так</param>
<param name="Захист від короткого замикання">Так</param>
<param name="Форма вихідної напруги">Чиста синусоїда</param>
<param name="Тип інвертора">Перетворювач напруги (без АКБ)</param>
<param name="Тип робочої величини">Потужність</param>
<param name="Номінальна потужність" unit="Вт">500</param>
<param name="Номінальна вхідна напруга">12 В</param>
<param name="Номінальна вихідна напруга">220 В</param>
<param name="Захист від перевантажень">Так</param>
</offer>
<offer id="EN-2018547-4" available="true">
<price>799</price>
<currencyId>UAH</currencyId>
<categoryId>990003</categoryId>
<picture>https://images.prom.ua/7735980282_elektroodeyalo-s-pultom.jpg</picture>
<picture>https://images.prom.ua/7735982664_elektroodeyalo-s-pultom.jpg</picture>
<picture>https://images.prom.ua/7735982551_elektroodeyalo-s-pultom.jpg</picture>
<vendor>1-А ФАБРИКА КОРИСНИХ ТОВАРІВ</vendor>
<vendorCode>2018547/4</vendorCode>
<quantity_in_stock>7</quantity_in_stock>
<name>Электроодеяло с пультом управления Сердце / Электропростынь 150×120см 130 Вт</name>
<name_ua>Електроковдра з пультом управління Серце / Електропростирадло 150×120см 130 Вт</name_ua>
<description><![CDATA[<p><strong>Электроодеяло с пультом управления 150&times;120 см, 130 Вт &ndash; комфортное решение для холодного времени года.</strong></p>
<p>Электроодеяло равномерно прогревается и помогает создать комфортное тепло во время отдыха дома, на даче или в офисе.</p>
<p>Модель имеет удобный пульт-переключатель с&nbsp;<strong>2 температурними режимами</strong>. Время нагрева составляет примерно&nbsp;<strong>7 минут</strong>.&nbsp;</p>
<h3 data-section-id="hotu7e">Преимущества:</h3>
<ul>
<li data-section-id="bvt69p">размер&nbsp;<strong>150 х 120 см</strong>;</li>
<li data-section-id="m6ldwj">мощность&nbsp;<strong>130 Вт</strong>;</li>
<li data-section-id="1u8oxhh">2 температурных режима;</li>
<li data-section-id="17ijq8y">удобное управление пультом;</li>
<li data-section-id="1rlam0f">быстрый нагрев;</li>
<li data-section-id="1ij7sn9">мягкое нетканое полотно;</li>
<li data-section-id="19demkw">подходит для кровати, дивана или кресла;</li>
<li data-section-id="bmotbz">питание от электросети;</li>
<li data-section-id="od06cj">компактно складывается для хранения.</li>
</ul>
<p>Электроодеяло станет практичным дополнением для комфортного отдыха в прохладную погоду.</p>
<p><strong>Комплектация:</strong>&nbsp;электроодеяло, пульт-переключатель.&nbsp;</p>]]></description>
<description_ua><![CDATA[<p><strong>Електроковдра з пультом управління 150&times;120 см, 130 Вт &mdash; комфортне рішення для холодної пори року.</strong></p>
<p>Електроковдра рівномірно прогрівається та допомагає створити комфортне тепло під час відпочинку вдома, на дачі або в офісі.</p>
<p>Модель має зручний пульт-перемикач із&nbsp;<strong>2 температурними режимами</strong>. Час нагрівання становить приблизно&nbsp;<strong>7 хвилин</strong>.&nbsp;</p>
<h3 data-section-id="hotu7e">Переваги:</h3>
<ul>
<li data-section-id="bvt69p">розмір&nbsp;<strong>150&times;120 см</strong>;</li>
<li data-section-id="m6ldwj">потужність&nbsp;<strong>130 Вт</strong>;</li>
<li data-section-id="1u8oxhh">2 температурні режими;</li>
<li data-section-id="17ijq8y">зручне керування пультом;</li>
<li data-section-id="1rlam0f">швидке нагрівання;</li>
<li data-section-id="1ij7sn9">м&#39;яке неткане полотно;</li>
<li data-section-id="19demkw">підходить для ліжка, дивана або крісла;</li>
<li data-section-id="bmotbz">живлення від електромережі;</li>
<li data-section-id="od06cj">компактно складається для зберігання.</li>
</ul>
<p>Електроковдра стане практичним доповненням для комфортного відпочинку в прохолодну погоду.</p>
<p><strong>Комплектація:</strong>&nbsp;електроковдра, пульт-перемикач.&nbsp;</p>]]></description_ua>
<keywords>электроодеяло, электрическое одеяло, электроодеяло с подогревом, одеяло с подогревом, электропростынь, электрическая простынь, электропростынь с подогревом, электроодеяло с пультом, электроодеяло 130 Вт, электроодеяло 150х120, электрическое одеяло 150х120, одеяло электрическое для дома, электроодеяло для кровати, электроодеяло для дивана, одеяло с электрическим подогревом, электрическое одеяло белое, электроодеяло белое, одеяло с регулировкой температуры, электроодеяло 2 режима, электроодеяло 2018547</keywords>
<keywords_ua>електроковдра, електрична ковдра, електроковдра з підігрівом, ковдра з підігрівом, електропростирадло, електричне простирадло, електропростирадло з підігрівом, електроковдра з пультом, електроковдра 130 Вт, електроковдра 150х120, електрична ковдра 150х120, ковдра електрична для дому, електроковдра для ліжка, електроковдра для дивана, ковдра з електричним підігрівом, електрична ковдра біла, електроковдра біла, ковдра з регулюванням температури, електроковдра 2 режими, електроковдра 2018547</keywords_ua>
<param name="Ширина" unit="см">120</param>
<param name="Довжина" unit="см">150</param>
<param name="Вага" unit="г">1.5</param>
<param name="Тип">Електричні ковдри</param>
<param name="Колір">Рожевий</param>
<param name="Захист від перегріву">Так</param>
<param name="Тип тканини">Неткане полотно</param>
<param name="Розмір">Полуторний</param>
<param name="Машинне прання">Ні</param>
<param name="Кількість температурних режимів">2</param>
<param name="Живлення">Мережа 220В</param>
</offer>
<offer id="EN-2018547-3" available="true">
<price>799</price>
<currencyId>UAH</currencyId>
<categoryId>990003</categoryId>
<picture>https://images.prom.ua/7735865224_elektroodeyalo-s-pultom.jpg</picture>
<picture>https://images.prom.ua/7735867674_elektroodeyalo-s-pultom.jpg</picture>
<picture>https://images.prom.ua/7735868041_elektroodeyalo-s-pultom.jpg</picture>
<vendor>1-А ФАБРИКА КОРИСНИХ ТОВАРІВ</vendor>
<vendorCode>2018547/3</vendorCode>
<quantity_in_stock>7</quantity_in_stock>
<name>Электроодеяло с пультом управления Белый / Электропростынь 150×120см 130 Вт</name>
<name_ua>Електроковдра з пультом управління Білий / Електропростирадло 150×120см 130 Вт</name_ua>
<description><![CDATA[<p><strong>Электроодеяло с пультом управления 150&times;120 см, 130 Вт &ndash; комфортное решение для холодного времени года.</strong></p>
<p>Электроодеяло равномерно прогревается и помогает создать комфортное тепло во время отдыха дома, на даче или в офисе.</p>
<p>Модель имеет удобный пульт-переключатель с&nbsp;<strong>2 температурними режимами</strong>. Время нагрева составляет примерно&nbsp;<strong>7 минут</strong>.&nbsp;</p>
<h3 data-section-id="hotu7e">Преимущества:</h3>
<ul>
<li data-section-id="bvt69p">размер&nbsp;<strong>150 х 120 см</strong>;</li>
<li data-section-id="m6ldwj">мощность&nbsp;<strong>130 Вт</strong>;</li>
<li data-section-id="1u8oxhh">2 температурных режима;</li>
<li data-section-id="17ijq8y">удобное управление пультом;</li>
<li data-section-id="1rlam0f">быстрый нагрев;</li>
<li data-section-id="1ij7sn9">мягкое нетканое полотно;</li>
<li data-section-id="19demkw">подходит для кровати, дивана или кресла;</li>
<li data-section-id="bmotbz">питание от электросети;</li>
<li data-section-id="od06cj">компактно складывается для хранения.</li>
</ul>
<p>Электроодеяло станет практичным дополнением для комфортного отдыха в прохладную погоду.</p>
<p><strong>Комплектация:</strong>&nbsp;электроодеяло, пульт-переключатель.&nbsp;</p>]]></description>
<description_ua><![CDATA[<p><strong>Електроковдра з пультом управління 150&times;120 см, 130 Вт &mdash; комфортне рішення для холодної пори року.</strong></p>
<p>Електроковдра рівномірно прогрівається та допомагає створити комфортне тепло під час відпочинку вдома, на дачі або в офісі.</p>
<p>Модель має зручний пульт-перемикач із&nbsp;<strong>2 температурними режимами</strong>. Час нагрівання становить приблизно&nbsp;<strong>7 хвилин</strong>.&nbsp;</p>
<h3 data-section-id="hotu7e">Переваги:</h3>
<ul>
<li data-section-id="bvt69p">розмір&nbsp;<strong>150&times;120 см</strong>;</li>
<li data-section-id="m6ldwj">потужність&nbsp;<strong>130 Вт</strong>;</li>
<li data-section-id="1u8oxhh">2 температурні режими;</li>
<li data-section-id="17ijq8y">зручне керування пультом;</li>
<li data-section-id="1rlam0f">швидке нагрівання;</li>
<li data-section-id="1ij7sn9">м&#39;яке неткане полотно;</li>
<li data-section-id="19demkw">підходить для ліжка, дивана або крісла;</li>
<li data-section-id="bmotbz">живлення від електромережі;</li>
<li data-section-id="od06cj">компактно складається для зберігання.</li>
</ul>
<p>Електроковдра стане практичним доповненням для комфортного відпочинку в прохолодну погоду.</p>
<p><strong>Комплектація:</strong>&nbsp;електроковдра, пульт-перемикач.&nbsp;</p>]]></description_ua>
<keywords>электроодеяло, электрическое одеяло, электроодеяло с подогревом, одеяло с подогревом, электропростынь, электрическая простынь, электропростынь с подогревом, электроодеяло с пультом, электроодеяло 130 Вт, электроодеяло 150х120, электрическое одеяло 150х120, одеяло электрическое для дома, электроодеяло для кровати, электроодеяло для дивана, одеяло с электрическим подогревом, электрическое одеяло белое, электроодеяло белое, одеяло с регулировкой температуры, электроодеяло 2 режима, электроодеяло 2018547</keywords>
<keywords_ua>електроковдра, електрична ковдра, електроковдра з підігрівом, ковдра з підігрівом, електропростирадло, електричне простирадло, електропростирадло з підігрівом, електроковдра з пультом, електроковдра 130 Вт, електроковдра 150х120, електрична ковдра 150х120, ковдра електрична для дому, електроковдра для ліжка, електроковдра для дивана, ковдра з електричним підігрівом, електрична ковдра біла, електроковдра біла, ковдра з регулюванням температури, електроковдра 2 режими, електроковдра 2018547</keywords_ua>
<param name="Ширина" unit="см">120</param>
<param name="Довжина" unit="см">150</param>
<param name="Вага" unit="г">1.5</param>
<param name="Тип">Електричні ковдри</param>
<param name="Колір">Білий</param>
<param name="Захист від перегріву">Так</param>
<param name="Тип тканини">Неткане полотно</param>
<param name="Розмір">Полуторний</param>
<param name="Машинне прання">Ні</param>
<param name="Кількість температурних режимів">2</param>
<param name="Живлення">Мережа 220В</param>
</offer>
<offer id="EN-2018547-2" available="true">
<price>799</price>
<currencyId>UAH</currencyId>
<categoryId>990003</categoryId>
<picture>https://images.prom.ua/7736012369_elektroodeyalo-s-pultom.jpg</picture>
<picture>https://images.prom.ua/7736013887_elektroodeyalo-s-pultom.jpg</picture>
<picture>https://images.prom.ua/7736013790_elektroodeyalo-s-pultom.jpg</picture>
<picture>https://images.prom.ua/7736013808_elektroodeyalo-s-pultom.jpg</picture>
<vendor>1-А ФАБРИКА КОРИСНИХ ТОВАРІВ</vendor>
<vendorCode>2018547/2</vendorCode>
<quantity_in_stock>7</quantity_in_stock>
<name>Электроодеяло с пультом управления Полоска/ Электропростынь 150×120см 130 Вт</name>
<name_ua>Електроковдра з пультом управління Смужка/ Електропростирадло 150×120см 130 Вт</name_ua>
<description><![CDATA[<p><strong>Электроодеяло с пультом управления 150&times;120 см, 130 Вт &ndash; комфортное решение для холодного времени года.</strong></p>
<p>Электроодеяло равномерно прогревается и помогает создать комфортное тепло во время отдыха дома, на даче или в офисе.</p>
<p>Модель имеет удобный пульт-переключатель с&nbsp;<strong>2 температурними режимами</strong>. Время нагрева составляет примерно&nbsp;<strong>7 минут</strong>.&nbsp;</p>
<h3 data-section-id="hotu7e">Преимущества:</h3>
<ul>
<li data-section-id="bvt69p">размер&nbsp;<strong>150 х 120 см</strong>;</li>
<li data-section-id="m6ldwj">мощность&nbsp;<strong>130 Вт</strong>;</li>
<li data-section-id="1u8oxhh">2 температурных режима;</li>
<li data-section-id="17ijq8y">удобное управление пультом;</li>
<li data-section-id="1rlam0f">быстрый нагрев;</li>
<li data-section-id="1ij7sn9">мягкое нетканое полотно;</li>
<li data-section-id="19demkw">подходит для кровати, дивана или кресла;</li>
<li data-section-id="bmotbz">питание от электросети;</li>
<li data-section-id="od06cj">компактно складывается для хранения.</li>
</ul>
<p>Электроодеяло станет практичным дополнением для комфортного отдыха в прохладную погоду.</p>
<p><strong>Комплектация:</strong>&nbsp;электроодеяло, пульт-переключатель.&nbsp;</p>]]></description>
<description_ua><![CDATA[<p><strong>Електроковдра з пультом управління 150&times;120 см, 130 Вт &mdash; комфортне рішення для холодної пори року.</strong></p>
<p>Електроковдра рівномірно прогрівається та допомагає створити комфортне тепло під час відпочинку вдома, на дачі або в офісі.</p>
<p>Модель має зручний пульт-перемикач із&nbsp;<strong>2 температурними режимами</strong>. Час нагрівання становить приблизно&nbsp;<strong>7 хвилин</strong>.&nbsp;</p>
<h3 data-section-id="hotu7e">Переваги:</h3>
<ul>
<li data-section-id="bvt69p">розмір&nbsp;<strong>150&times;120 см</strong>;</li>
<li data-section-id="m6ldwj">потужність&nbsp;<strong>130 Вт</strong>;</li>
<li data-section-id="1u8oxhh">2 температурні режими;</li>
<li data-section-id="17ijq8y">зручне керування пультом;</li>
<li data-section-id="1rlam0f">швидке нагрівання;</li>
<li data-section-id="1ij7sn9">м&#39;яке неткане полотно;</li>
<li data-section-id="19demkw">підходить для ліжка, дивана або крісла;</li>
<li data-section-id="bmotbz">живлення від електромережі;</li>
<li data-section-id="od06cj">компактно складається для зберігання.</li>
</ul>
<p>Електроковдра стане практичним доповненням для комфортного відпочинку в прохолодну погоду.</p>
<p><strong>Комплектація:</strong>&nbsp;електроковдра, пульт-перемикач.&nbsp;</p>]]></description_ua>
<keywords>электроодеяло, электрическое одеяло, электроодеяло с подогревом, одеяло с подогревом, электропростынь, электрическая простынь, электропростынь с подогревом, электроодеяло с пультом, электроодеяло 130 Вт, электроодеяло 150х120, электрическое одеяло 150х120, одеяло электрическое для дома, электроодеяло для кровати, электроодеяло для дивана, одеяло с электрическим подогревом, электрическое одеяло белое, электроодеяло белое, одеяло с регулировкой температуры, электроодеяло 2 режима, электроодеяло 2018547</keywords>
<keywords_ua>електроковдра, електрична ковдра, електроковдра з підігрівом, ковдра з підігрівом, електропростирадло, електричне простирадло, електропростирадло з підігрівом, електроковдра з пультом, електроковдра 130 Вт, електроковдра 150х120, електрична ковдра 150х120, ковдра електрична для дому, електроковдра для ліжка, електроковдра для дивана, ковдра з електричним підігрівом, електрична ковдра біла, електроковдра біла, ковдра з регулюванням температури, електроковдра 2 режими, електроковдра 2018547</keywords_ua>
<param name="Ширина" unit="см">120</param>
<param name="Довжина" unit="см">150</param>
<param name="Вага" unit="г">1.5</param>
<param name="Тип">Електричні ковдри</param>
<param name="Колір">Рожевий</param>
<param name="Захист від перегріву">Так</param>
<param name="Тип тканини">Неткане полотно</param>
<param name="Розмір">Полуторний</param>
<param name="Машинне прання">Ні</param>
<param name="Кількість температурних режимів">2</param>
<param name="Живлення">Мережа 220В</param>
</offer>
<offer id="EN-P1000E-PLUS" available="true">
<price>26990</price>
<currencyId>UAH</currencyId>
<categoryId>990004</categoryId>
<picture>https://images.prom.ua/7736424876_portativnaya-zaryadnaya-stantsiya.jpg</picture>
<picture>https://images.prom.ua/7736425327_portativnaya-zaryadnaya-stantsiya.jpg</picture>
<picture>https://images.prom.ua/7736428737_portativnaya-zaryadnaya-stantsiya.jpg</picture>
<picture>https://images.prom.ua/7736428968_portativnaya-zaryadnaya-stantsiya.jpg</picture>
<picture>https://images.prom.ua/7736428966_portativnaya-zaryadnaya-stantsiya.jpg</picture>
<picture>https://images.prom.ua/7736428972_portativnaya-zaryadnaya-stantsiya.jpg</picture>
<vendor>Oukitel</vendor>
<vendorCode>P1000E PLUS</vendorCode>
<quantity_in_stock>3</quantity_in_stock>
<name>Портативная зарядная станция OUKITEL P1000E Plus 1800 Вт 1024 Вт*ч LiFePO 1024 Вт*ч + 1800 Вт + LiFePO4 + чистая синусоида + 364</name>
<name_ua>Портативна зарядна станція OUKITEL P1000E Plus 1800 Вт 1024 Вт·год LiFePO  1024 Вт·год + 1800 Вт + LiFePO4 + чиста синусоїда + 364</name_ua>
<description><![CDATA[<p>1024 Вт*ч + 1800 Вт + LiFePO4 + чистая синусоида + 3600 Вт пик + ИБП.</p>
<p></p>
<p><strong>Портативная зарядная станция OUKITEL P1000E Plus 1800 Вт / 1024 Вт*ч</strong>&nbsp;&mdash; мощный и универсальный источник резервного питания для дома, работы, путешествий и отдыха.</p>
<p>Станция оснащена аккумулятором&nbsp;<strong>LiFePO4 емкостью 1024 Вт*ч</strong>&nbsp;и обеспечивает номинальную мощность&nbsp;<strong>1800 Вт</strong>, а пиковая мощность достигает&nbsp;<strong>3600 Вт</strong>. Благодаря чистой синусоиде станция подходит для питания широкого спектра бытовой и электронной техники.&nbsp;</p>
<h3 data-section-id="x3rmqc">⚡ Основные преимущества</h3>
<ul>
<li data-section-id="he2l24"><strong>1024 Вт*ч</strong>&nbsp;&mdash; большой запас энергии</li>
<li data-section-id="v6tbpy"><strong>1800 Вт</strong>&nbsp;номинальной мощности</li>
<li data-section-id="15i8hpd"><strong>до 3600 Вт</strong>&nbsp;пиковой мощности</li>
<li data-section-id="1qoeqhf">современный аккумулятор&nbsp;<strong>LiFePO4</strong></li>
<li data-section-id="nauast">ресурс &mdash;&nbsp;<strong>до 4000 циклов</strong>&nbsp;до 80% начальной емкости</li>
<li data-section-id="bl9szz"><strong>чистая синусоида</strong></li>
<li data-section-id="1rknmr2">функция&nbsp;<strong>EPS / ДБЖ</strong>&nbsp;с переключением до 10 мс</li>
<li data-section-id="1elvc85">быстрая зарядка от сети &mdash; до&nbsp;<strong>1200 Вт</strong></li>
<li data-section-id="l4xfik">зарядка от солнечных панелей &mdash; до&nbsp;<strong>500 Вт</strong></li>
<li data-section-id="iz4j9e">зарядка от автомобиля</li>
<li data-section-id="aop1sg">одновременная зарядка различными способами</li>
<li data-section-id="6yhxo1">управление и контроль через&nbsp;<strong>смартфон</strong></li>
<li data-section-id="xwwh0l">компактный корпус и вес близко&nbsp;<strong>12 кг</strong>.&nbsp;</li>
</ul>
<h3 data-section-id="19yj937">🔌 Подключение техники</h3>
<p>OKITEL P1000E Plus имеет&nbsp;<strong>4 розетки AC 220&ndash;240 В</strong>&nbsp;с общей мощностью до 1800 Вт, USB-A, USB-C, DC выходы и автомобильный выход 12 В.</p>
<p>К станции можно подключать:</p>
<ul>
<li data-section-id="1pgoj3d">холодильник;</li>
<li data-section-id="1ubmkw7">телевизор;</li>
<li data-section-id="5lwmqt">Wi-Fi роутер;</li>
<li data-section-id="16b0fzm">ноутбук и компьютер;</li>
<li data-section-id="arpg7f">освещение;</li>
<li data-section-id="yuwtc9">зарядные устройства;</li>
<li data-section-id="15qfch9">бытовую технику;</li>
<li data-section-id="16uaouu">электроинструменты и другие совместимые устройства.</li>
</ul>
<h3 data-section-id="1nccze7">🏠 Для дому</h3>
<p>Функция&nbsp;<strong>EPS</strong>&nbsp;позволяет использовать станцию как резервный источник питания. При исчезновении электроэнергии переключения происходит менее чем при&nbsp;<strong>10 мс</strong>, что помогает поддерживать работу подключенной техники.&nbsp;</p>
<h3 data-section-id="mbikv7">🚗 Для подорожей</h3>
<p>Благодаря весу близко&nbsp;<strong>12 кг</strong>&nbsp;и удобной конструкции станцию можно брать на дачу, в кемпинг, путешествие, автомобильную поездку или использовать как автономный источник питания на природе.</p>
<h3 data-section-id="1e8lezr">☀️ Несколько способов зарядки</h3>
<p>Заряжать OUKITEL P1000E Plus можно:</p>
<p><strong>от розетки 220 В &mdash; до 1200 Вт</strong><br/>
<strong>от солнечных панелей &mdash; до 500 Вт</strong><br/>
<strong>от автомобиля</strong><br/>
<strong>комбинировано &mdash; AC + Solar до 1700 Вт</strong>.&nbsp;</p>
<h3 data-section-id="3venle">📱 Управление со смартфона</h3>
<p>Станцией можно управлять и контролировать ее работу через фирменное приложение &mdash; следить за состоянием батареи, режимами и настройками питания.&nbsp;</p>
<p><strong>OKITEL P1000E Plus &ndash; это универсальное решение для резервного питания дома и автономной работы техники там, где нет стабильного доступа к электросети.</strong></p>
<p><strong>Характеристики:</strong><br/>
Емкость:&nbsp;<strong>1024 Вт*ч</strong><br/>
Мощность:&nbsp;<strong>1800 Вт</strong><br/>
Пиковая мощность:&nbsp;<strong>3600 Вт</strong><br/>
Аккумулятор:&nbsp;<strong>LiFePO4</strong><br/>
Циклы:&nbsp;<strong>4000+</strong><br/>
Вес:&nbsp;<strong>12 кг</strong><br/>
Размер:&nbsp;<strong>346 &times; 228 &times; 238 мм</strong><br/>
Инвертор:&nbsp;<strong>чистая синусоида</strong>.&nbsp;</p>]]></description>
<description_ua><![CDATA[<p>1024 Вт&middot;год + 1800 Вт + LiFePO4 + чиста синусоїда + 3600 Вт пік + ДБЖ.</p>
<p></p>
<p><strong>Портативна зарядна станція OUKITEL P1000E Plus 1800 Вт / 1024 Вт&middot;год</strong>&nbsp;&mdash; потужне та універсальне джерело резервного живлення для дому, роботи, подорожей та відпочинку.</p>
<p>Станція оснащена акумулятором&nbsp;<strong>LiFePO4 ємністю 1024 Вт&middot;год</strong>&nbsp;та забезпечує номінальну потужність&nbsp;<strong>1800 Вт</strong>, а пікова потужність досягає&nbsp;<strong>3600 Вт</strong>. Завдяки чистій синусоїді станція підходить для живлення широкого спектра побутової та електронної техніки.&nbsp;</p>
<h3 data-section-id="x3rmqc">⚡ Основні переваги</h3>
<ul>
<li data-section-id="he2l24"><strong>1024 Вт&middot;год</strong>&nbsp;&mdash; великий запас енергії</li>
<li data-section-id="v6tbpy"><strong>1800 Вт</strong>&nbsp;номінальної потужності</li>
<li data-section-id="15i8hpd"><strong>до 3600 Вт</strong>&nbsp;пікової потужності</li>
<li data-section-id="1qoeqhf">сучасний акумулятор&nbsp;<strong>LiFePO4</strong></li>
<li data-section-id="nauast">ресурс &mdash;&nbsp;<strong>до 4000 циклів</strong>&nbsp;до 80% початкової ємності</li>
<li data-section-id="bl9szz"><strong>чиста синусоїда</strong></li>
<li data-section-id="1rknmr2">функція&nbsp;<strong>EPS / ДБЖ</strong>&nbsp;з перемиканням до 10 мс</li>
<li data-section-id="1elvc85">швидке заряджання від мережі &mdash; до&nbsp;<strong>1200 Вт</strong></li>
<li data-section-id="l4xfik">заряджання від сонячних панелей &mdash; до&nbsp;<strong>500 Вт</strong></li>
<li data-section-id="iz4j9e">заряджання від автомобіля</li>
<li data-section-id="aop1sg">одночасне заряджання різними способами</li>
<li data-section-id="6yhxo1">керування та контроль через&nbsp;<strong>смартфон</strong></li>
<li data-section-id="xwwh0l">компактний корпус та вага близько&nbsp;<strong>12 кг</strong>.&nbsp;</li>
</ul>
<h3 data-section-id="19yj937">🔌 Підключення техніки</h3>
<p>OUKITEL P1000E Plus має&nbsp;<strong>4 розетки AC 220&ndash;240 В</strong>&nbsp;із загальною потужністю до 1800 Вт, USB-A, USB-C, DC-виходи та автомобільний вихід 12 В.</p>
<p>До станції можна підключати:</p>
<ul>
<li data-section-id="1pgoj3d">холодильник;</li>
<li data-section-id="1ubmkw7">телевізор;</li>
<li data-section-id="5lwmqt">Wi-Fi роутер;</li>
<li data-section-id="16b0fzm">ноутбук та комп&#39;ютер;</li>
<li data-section-id="arpg7f">освітлення;</li>
<li data-section-id="yuwtc9">зарядні пристрої;</li>
<li data-section-id="15qfch9">побутову техніку;</li>
<li data-section-id="16uaouu">електроінструменти та інші сумісні пристрої.</li>
</ul>
<h3 data-section-id="1nccze7">🏠 Для дому</h3>
<p>Функція&nbsp;<strong>EPS</strong>&nbsp;дозволяє використовувати станцію як резервне джерело живлення. При зникненні електроенергії перемикання відбувається менш ніж за&nbsp;<strong>10 мс</strong>, що допомагає підтримувати роботу підключеної техніки.&nbsp;</p>
<h3 data-section-id="mbikv7">🚗 Для подорожей</h3>
<p>Завдяки вазі близько&nbsp;<strong>12 кг</strong>&nbsp;та зручній конструкції станцію можна брати на дачу, у кемпінг, подорож, автомобільну поїздку або використовувати як автономне джерело живлення на природі.</p>
<h3 data-section-id="1e8lezr">☀️ Кілька способів заряджання</h3>
<p>Заряджати OUKITEL P1000E Plus можна:</p>
<p><strong>від розетки 220 В &mdash; до 1200 Вт</strong><br/>
<strong>від сонячних панелей &mdash; до 500 Вт</strong><br/>
<strong>від автомобіля</strong><br/>
<strong>комбіновано &mdash; AC + Solar до 1700 Вт</strong>.&nbsp;</p>
<h3 data-section-id="3venle">📱 Керування зі смартфона</h3>
<p>Станцією можна керувати та контролювати її роботу через фірмовий застосунок &mdash; стежити за станом батареї, режимами та параметрами живлення.&nbsp;</p>
<p><strong>OUKITEL P1000E Plus &mdash; це універсальне рішення для резервного живлення вдома та автономної роботи техніки там, де немає стабільного доступу до електромережі.</strong></p>
<p><strong>Характеристики:</strong><br/>
Ємність:&nbsp;<strong>1024 Вт&middot;год</strong><br/>
Потужність:&nbsp;<strong>1800 Вт</strong><br/>
Пікова потужність:&nbsp;<strong>3600 Вт</strong><br/>
Акумулятор:&nbsp;<strong>LiFePO4</strong><br/>
Цикли:&nbsp;<strong>4000+</strong><br/>
Вага:&nbsp;<strong>12 кг</strong><br/>
Розмір:&nbsp;<strong>346 &times; 228 &times; 238 мм</strong><br/>
Інвертор:&nbsp;<strong>чиста синусоїда</strong>.&nbsp;</p>]]></description_ua>
<keywords>зарядная станция, портативная зарядная станция, зарядная станция для дома, зарядная станция 1800 Вт, зарядная станция 1024 Вт ч, зарядная станция 1024Wh, OUKITEL P1000E Plus, OUKITEL P1000E, OUKITEL P1000 Plus, повербанк 1024 Вт, мощный повербанк, портативный аккумулятор, аккумуляторная станция, автономное питание, резервное питание, резервное питание для дома, зарядная станция для квартиры, зарядная станция для холодильника, зарядная станция для котла, зарядная станция для роутера, зарядная станция для ноутбука, зарядная станция для телевизора, зарядная станция LiFePO4, LiFePO4 зарядная станция, зарядная станция 220В, электростанция портативная, портативная электростанция, генератор электроэнергии, инверторный генератор, ИБП, UPS, зарядная станция с ИБП, зарядная станция чистая синусоида, зарядная станция для блэкаута, зарядная станция для отключения света, станция резервного питания, power station, portable power station</keywords>
<keywords_ua>зарядна станція, портативна зарядна станція, зарядна станція для дому, зарядна станція 1800 Вт, зарядна станція 1024 Вт год, зарядна станція 1024Wh, OUKITEL P1000E Plus, OUKITEL P1000E, OUKITEL P1000 Plus, повербанк 1024 Вт год, потужний повербанк, портативний акумулятор, акумуляторна станція, автономне живлення, резервне живлення, резервне живлення для дому, зарядна станція для квартири, зарядна станція для холодильника, зарядна станція для котла, зарядна станція для роутера, зарядна станція для ноутбука, зарядна станція для телевізора, зарядна станція LiFePO4, LiFePO4 зарядна станція, зарядна станція 220В, електростанція портативна, портативна електростанція, генератор електроенергії, інверторний генератор, ДБЖ, UPS, зарядна станція з ДБЖ, зарядна станція чиста синусоїда, зарядна станція для блекауту, зарядна станція для відключення світла, станція резервного живлення, power station, portable power station</keywords_ua>
<country_of_origin>Китай</country_of_origin>
<param name="Ширина" unit="мм">228</param>
<param name="Довжина" unit="мм">346</param>
<param name="Вага" unit="кг">12</param>
<param name="Тип">Зарядна станція</param>
<param name="Стан">Новий</param>
<param name="Висота" unit="мм">238</param>
<param name="Особливості">З ліхтариком, Функція ДБЖ (UPS), Швидке заряджання батареї, З ручкою, З управлінням через смартфон</param>
<param name="Колір корпусу">Сірий</param>
<param name="Час зарядки" unit="годин">1</param>
<param name="Тип акумулятора">LiFePO4</param>
<param name="Призначення">Універсальна</param>
<param name="Матеріал корпусу">Пластик</param>
<param name="Гарантійний термін" unit="міс">24</param>
<param name="Вихідна напруга" unit="В">240</param>
<param name="Ємність акумулятору" unit="мА/год">1024</param>
<param name="Цикли зарядки">4000</param>
<param name="Функція ДБЖ">Так</param>
<param name="Тип (версія) розеток">Європейський</param>
<param name="Роз'єми">AC, Type-C, DC, USB Type-A, XT60</param>
<param name="Місткість зарядної станції, Вт*год">1024</param>
<param name="Максимальна потужність заряджання (220В), Вт">1200</param>
<param name="Максимальна потужність W">3600</param>
<param name="Кількість розеток">4</param>
<param name="Кількість пристроїв, що заряджаються">11</param>
<param name="Країна реєстрації бренда">Китай</param>
<param name="Зарядка батареї">Від мережі</param>
<param name="Вхідна напруга" unit="В">240</param>
<param name="Вихідні інтерфейси">USB Type A</param>
<param name="Вихідний струм" unit="мА">10000</param>
<param name="Вихідна потужність (загальна), Вт">1800</param>
</offer>
<offer id="EN-P2001E-Plus" available="true">
<price>{{SALE:47490:48990}}</price>
{{OLD:48990}}
<currencyId>UAH</currencyId>
<categoryId>990004</categoryId>
<picture>https://images.prom.ua/7736518736_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736526384_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736527549_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736528034_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736528223_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736530130_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736530131_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736530132_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736511576_zaryadnaya-stantsiya-oukitel.jpg</picture>
<vendor>Oukitel</vendor>
<vendorCode>P2001E Plus</vendorCode>
<quantity_in_stock>3</quantity_in_stock>
<name>Зарядная станция Oukitel P2001E Plus 2400W 2048Wh LiFePO4, портативная электростанция</name>
<name_ua>Зарядна станція Oukitel P2001E Plus 2400W 2048Wh LiFePO4, портативна електростанція</name_ua>
<description><![CDATA[<p><strong>Портативная зарядная станция Oukitel P2001E Plus 2400 Вт 2048 Вт*ч</strong>&nbsp;&mdash; мощное решение для резервного питания дома, квартиры, офиса, техники и электроприборов при отключении электроэнергии.</p>
<p>Станция оснащена аккумулятором&nbsp;<strong>LiFePO4 емкостью 2048 Вт*ч</strong>&nbsp;и инвертором с номинальной мощностью&nbsp;<strong>2400 Вт</strong>. Максимальная пиковая мощность &mdash;&nbsp;<strong>4800 Вт</strong>, что позволяет подключать приборы с высокой стартовой нагрузкой.</p>
<h3 data-section-id="ts3zjk">Основные характеристики:</h3>
<ul>
<li data-section-id="1ihf0kw">Емкость -&nbsp;<strong>2048 Вт*ч</strong></li>
<li data-section-id="1mq0xd2">Номинальная мощность &mdash;&nbsp;<strong>2400 Вт</strong></li>
<li data-section-id="cabsrh">Пиковая мощность &mdash;&nbsp;<strong>4800 Вт</strong></li>
<li data-section-id="eg25an">Аккумулятор &mdash;&nbsp;<strong>LiFePO4</strong></li>
<li data-section-id="1hl12nj">Чистая синусоида</li>
<li data-section-id="xemtjk">Функция&nbsp;<strong>ДБЖ (UPS)</strong>&nbsp;с переключением до 10 мс</li>
<li data-section-id="oa5nj6">4 розетки AC</li>
<li data-section-id="11pyieg">USB-A &mdash; 2&times;18 Вт</li>
<li data-section-id="xi43kh">USB-C &mdash; 100 Вт + 45 Вт + 2&times;20 Вт</li>
<li data-section-id="1ua6hke">Автомобильный выход - 12В / 10А</li>
<li data-section-id="6m3et2">Зарядка от сети &mdash; до&nbsp;<strong>1800 Вт</strong></li>
<li data-section-id="7062b0">Зарядка от солнечных панелей &mdash; до&nbsp;<strong>500 Вт</strong></li>
<li data-section-id="145xdpd">Управление и мониторинг со смартфона</li>
<li data-section-id="17v4ih7">LCD-дисплей</li>
<li data-section-id="1rw731r">Возможность одновременного питания до&nbsp;<strong>13 устройств</strong></li>
<li data-section-id="sle21g">Вес -&nbsp;<strong>22 кг</strong></li>
</ul>
<h3 data-section-id="9gta18">Для чего подходит:</h3>
<p>Oukitel P2001E Plus можно использовать для резервного питания&nbsp;<strong>холодильника, роутера, телевизора, ноутбука, освещения, котла, насоса, электроинструмента и другой техники</strong>.</p>
<p>Станция станет практичным решением для дома, работы, путешествий, кемпинга и использования при отключениях электроэнергии.</p>
<h3 data-section-id="p3yoyq">Комплектация:</h3>
<ul>
<li data-section-id="5t6q2i">зарядная станция Oukitel P2001E Plus;</li>
<li data-section-id="1qjbv5x">кабели для зарядки;</li>
<li data-section-id="1o0tvfs">инструкция.</li>
</ul>
<p><strong>Состояние: новый.</strong></p>]]></description>
<description_ua><![CDATA[<p><strong>Портативна зарядна станція Oukitel P2001E Plus 2400 Вт 2048 Вт&middot;год</strong>&nbsp;&mdash; потужне рішення для резервного живлення будинку, квартири, офісу, техніки та електроприладів під час відключення електроенергії.</p>
<p>Станція оснащена акумулятором&nbsp;<strong>LiFePO4 ємністю 2048 Вт&middot;год</strong>&nbsp;та інвертором із номінальною потужністю&nbsp;<strong>2400 Вт</strong>. Максимальна пікова потужність &mdash;&nbsp;<strong>4800 Вт</strong>, що дозволяє підключати прилади з високим стартовим навантаженням.</p>
<h3 data-section-id="ts3zjk">Основні характеристики:</h3>
<ul>
<li data-section-id="1ihf0kw">Ємність &mdash;&nbsp;<strong>2048 Вт&middot;год</strong></li>
<li data-section-id="1mq0xd2">Номінальна потужність &mdash;&nbsp;<strong>2400 Вт</strong></li>
<li data-section-id="cabsrh">Пікова потужність &mdash;&nbsp;<strong>4800 Вт</strong></li>
<li data-section-id="eg25an">Акумулятор &mdash;&nbsp;<strong>LiFePO4</strong></li>
<li data-section-id="1hl12nj">Чиста синусоїда</li>
<li data-section-id="xemtjk">Функція&nbsp;<strong>ДБЖ (UPS)</strong>&nbsp;з перемиканням до 10 мс</li>
<li data-section-id="oa5nj6">4 розетки AC</li>
<li data-section-id="11pyieg">USB-A &mdash; 2&times;18 Вт</li>
<li data-section-id="xi43kh">USB-C &mdash; 100 Вт + 45 Вт + 2&times;20 Вт</li>
<li data-section-id="1ua6hke">Автомобільний вихід &mdash; 12 В / 10 А</li>
<li data-section-id="6m3et2">Заряджання від мережі &mdash; до&nbsp;<strong>1800 Вт</strong></li>
<li data-section-id="7062b0">Заряджання від сонячних панелей &mdash; до&nbsp;<strong>500 Вт</strong></li>
<li data-section-id="145xdpd">Керування та моніторинг зі смартфона</li>
<li data-section-id="17v4ih7">LCD-дисплей</li>
<li data-section-id="1rw731r">Можливість одночасного живлення до&nbsp;<strong>13 пристроїв</strong></li>
<li data-section-id="sle21g">Вага &mdash;&nbsp;<strong>22 кг</strong></li>
</ul>
<h3 data-section-id="9gta18">Для чого підходить:</h3>
<p>Oukitel P2001E Plus можна використовувати для резервного живлення&nbsp;<strong>холодильника, роутера, телевізора, ноутбука, освітлення, котла, насоса, електроінструменту та іншої техніки</strong>.</p>
<p>Станція стане практичним рішенням для дому, роботи, подорожей, кемпінгу та використання під час відключень електроенергії.</p>
<h3 data-section-id="p3yoyq">Комплектація:</h3>
<ul>
<li data-section-id="5t6q2i">зарядна станція Oukitel P2001E Plus;</li>
<li data-section-id="1qjbv5x">кабелі для заряджання;</li>
<li data-section-id="1o0tvfs">інструкція.</li>
</ul>
<p><strong>Стан: новий.</strong></p>]]></description_ua>
<keywords>зарядная станция, портативная зарядная станция, Oukitel P2001E Plus, Oukitel P2001 Plus, Oukitel P2001E, зарядная станция 2400 Вт, зарядная станция 2048 Вт ч, зарядная станция 2048Wh, зарядная станция LiFePO4, LiFePO4 зарядная станция, зарядная станция для дома, зарядная станция для квартиры, зарядная станция для блэкаута, зарядная станция при отключении света, резервное питание, резервное питание для дома, аккумуляторная станция, портативная электростанция, электростанция портативная, мощная зарядная станция, зарядная станция 220В, зарядная станция с ИБП, ИБП, UPS, зарядная станция чистая синусоида, зарядная станция для холодильника, зарядная станция для котла, зарядная станция для роутера, зарядная станция для телевизора, зарядная станция для ноутбука, зарядная станция для насоса, зарядная станция для электроинструмента, зарядная станция для техники, зарядная станция для кемпинга, зарядная станция для путешествий, автономное питание, автономное электропитание, резервная электростанция, power station, portab</keywords>
<keywords_ua>зарядна станція, портативна зарядна станція, Oukitel P2001E Plus, Oukitel P2001 Plus, Oukitel P2001E, зарядна станція 2400 Вт, зарядна станція 2048 Вт год, зарядна станція 2048Wh, зарядна станція LiFePO4, LiFePO4 зарядна станція, зарядна станція для дому, зарядна станція для квартири, зарядна станція для блекауту, зарядна станція при відключенні світла, резервне живлення, резервне живлення для дому, акумуляторна станція, портативна електростанція, електростанція портативна, потужна зарядна станція, зарядна станція 220В, зарядна станція з ДБЖ, ДБЖ, UPS, зарядна станція чиста синусоїда, зарядна станція для холодильника, зарядна станція для котла, зарядна станція для роутера, зарядна станція для телевізора, зарядна станція для ноутбука, зарядна станція для насоса, зарядна станція для електроінструменту, зарядна станція для техніки, зарядна станція для кемпінгу, зарядна станція для подорожей, автономне живлення, автономне електроживлення, резервна електростанція, power station, portable power station</keywords_ua>
<country_of_origin>Китай</country_of_origin>
<param name="Ширина" unit="мм">286</param>
<param name="Довжина" unit="мм">399</param>
<param name="Вага" unit="кг">22</param>
<param name="Тип">Зарядна станція</param>
<param name="Стан">Новий</param>
<param name="Висота" unit="мм">320</param>
<param name="Особливості">Швидке заряджання батареї, З ручкою, З управлінням через смартфон</param>
<param name="Колір корпусу">Чорний</param>
<param name="Час зарядки" unit="годин">1</param>
<param name="Тип акумулятора">LiFePO4</param>
<param name="Призначення">Для всього будинку</param>
<param name="Матеріал корпусу">Пластик</param>
<param name="Гарантійний термін" unit="міс">12</param>
<param name="Вихідна напруга" unit="В">240</param>
<param name="Ємність акумулятору" unit="мА/год">40000</param>
<param name="Цикли зарядки">3500</param>
<param name="Функція ДБЖ">Так</param>
<param name="Тип (версія) розеток">Європейський</param>
<param name="Роз'єми">Type-C, USB Type-A, XT60, AC</param>
<param name="Місткість зарядної станції, Вт*год">2048</param>
<param name="Максимальна потужність заряджання (220В), Вт">1800</param>
<param name="Максимальна потужність W">4800</param>
<param name="Кількість розеток">4</param>
<param name="Кількість пристроїв, що заряджаються">13</param>
<param name="Країна реєстрації бренда">Китай</param>
<param name="Зарядка батареї">Від мережі, Від сонячної енергія, Від автомобільної зарядки</param>
<param name="Вхідна напруга" unit="В">230</param>
<param name="Вихідні інтерфейси">USB Type A</param>
<param name="Вихідний струм" unit="мА">10000</param>
<param name="Вихідна потужність (загальна), Вт">2400</param>
</offer>
<offer id="EN-P5000E-PRO" available="true">
<price>106990</price>
<currencyId>UAH</currencyId>
<categoryId>990004</categoryId>
<picture>https://images.prom.ua/7736605007_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736608800_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736605097_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736605098_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736605145_zaryadnaya-stantsiya-oukitel.jpg</picture>
<vendor>Oukitel</vendor>
<vendorCode>P5000E PRO</vendorCode>
<quantity_in_stock>3</quantity_in_stock>
<name>Зарядная станция OUKITEL P5000E PRO 4000W 5120Wh LiFePO4, портативная электростанция</name>
<name_ua>Зарядна станція OUKITEL P5000E PRO 4000W 5120Wh LiFePO4, портативна електростанція</name_ua>
<description><![CDATA[<p><strong>OKITEL P5000E PRO - мощная портативная зарядная станция емкостью 5120 Вт*ч и номинальной мощностью 4000 Вт.</strong></p>
<p>Станция оснащена долговечным аккумулятором&nbsp;<strong>LiFePO4</strong>, чистой синусоидой и системой резервного питания. Пиковая мощность составляет&nbsp;<strong>8000 Вт</strong>, поэтому станция подходит не только для бытовой электроники, но и для мощных электроприборов и электроинструмента.</p>
<p><strong>Основные преимущества:</strong></p>
<ul>
<li data-section-id="1rpq0s5">5120 Вт*ч емкости;</li>
<li data-section-id="1dif2cg">4000 Вт номинальной мощности;</li>
<li data-section-id="1utf2l9">8000 Вт пиковой мощности;</li>
<li data-section-id="kmlmlc">LiFePO4 акумулятор;</li>
<li data-section-id="uj7b40">более 5000 циклов зарядки;</li>
<li data-section-id="19dl4us">чистая синусоида;</li>
<li data-section-id="6ulbne">UPS / резервное питание;</li>
<li data-section-id="1phojkg">переключение на резервное питание &lt;10 мс;</li>
<li data-section-id="11k3kr5">зарядка от сети до 3200 Вт;</li>
<li data-section-id="17q500v">солнечная зарядка до 1000 Вт;</li>
<li data-section-id="jbgkmj">Wi-Fi и Bluetooth;</li>
<li data-section-id="iig2op">5 розеток AC 220&ndash;240 В;</li>
<li data-section-id="pgcmba">USB-A и USB-C PD 100 Вт;</li>
<li data-section-id="19t15k4">DC выходы;</li>
<li data-section-id="1ycrg4u">автомобильный выход;</li>
<li data-section-id="8sijy8">большие колеса и телескопическая ручка для транспортировки;</li>
<li data-section-id="veb47c">вага 53 кг.</li>
</ul>
<p><strong>Для чего подходит:</strong></p>
<p>P5000E PRO можно использовать как резервный источник питания для&nbsp;<strong>дома, квартиры, офиса, холодильника, котла, роутера, телевизора, компьютера, освещения, насоса и электроинструмента</strong>.</p>
<p>Также станция подходит для автономной работы, загородного дома, кемпинга, мастерской и работы с мощным электрооборудованием.&nbsp;</p>
<p data-is-last-node="" data-is-only-node=""><strong>Комплектация:</strong>&nbsp;зарядная станция, кабель зарядки от сети, кабель для автомобильной зарядки, кабель для солнечной панели, инструкция.&nbsp;</p>]]></description>
<description_ua><![CDATA[<p><strong>OUKITEL P5000E PRO &mdash; потужна портативна зарядна станція ємністю 5120 Вт&middot;год та номінальною потужністю 4000 Вт.</strong></p>
<p>Станція оснащена довговічним акумулятором&nbsp;<strong>LiFePO4</strong>, чистою синусоїдою та системою резервного живлення. Пікова потужність становить&nbsp;<strong>8000 Вт</strong>, тому станція підходить не тільки для побутової електроніки, а й для потужних електроприладів та електроінструменту.</p>
<p><strong>Основні переваги:</strong></p>
<ul>
<li data-section-id="1rpq0s5">5120 Вт&middot;год ємності;</li>
<li data-section-id="1dif2cg">4000 Вт номінальної потужності;</li>
<li data-section-id="1utf2l9">8000 Вт пікової потужності;</li>
<li data-section-id="kmlmlc">LiFePO4 акумулятор;</li>
<li data-section-id="uj7b40">понад 5000 циклів заряджання;</li>
<li data-section-id="19dl4us">чиста синусоїда;</li>
<li data-section-id="6ulbne">UPS / резервне живлення;</li>
<li data-section-id="1phojkg">перемикання на резервне живлення &lt;10 мс;</li>
<li data-section-id="11k3kr5">заряджання від мережі до 3200 Вт;</li>
<li data-section-id="17q500v">сонячне заряджання до 1000 Вт;</li>
<li data-section-id="jbgkmj">Wi-Fi та Bluetooth;</li>
<li data-section-id="iig2op">5 розеток AC 220&ndash;240 В;</li>
<li data-section-id="pgcmba">USB-A та USB-C PD 100 Вт;</li>
<li data-section-id="19t15k4">DC-виходи;</li>
<li data-section-id="1ycrg4u">автомобільний вихід;</li>
<li data-section-id="8sijy8">великі колеса та телескопічна ручка для транспортування;</li>
<li data-section-id="veb47c">вага 53 кг.</li>
</ul>
<p><strong>Для чого підходить:</strong></p>
<p>P5000E PRO можна використовувати як резервне джерело живлення для&nbsp;<strong>будинку, квартири, офісу, холодильника, котла, роутера, телевізора, комп&#39;ютера, освітлення, насоса та електроінструменту</strong>.</p>
<p>Також станція підходить для автономної роботи, заміського будинку, кемпінгу, майстерні та роботи з потужним електрообладнанням.&nbsp;</p>
<p data-is-last-node="" data-is-only-node=""><strong>Комплектація:</strong>&nbsp;зарядна станція, кабель заряджання від мережі, кабель для автомобільного заряджання, кабель для сонячної панелі, інструкція.&nbsp;</p>]]></description_ua>
<keywords>зарядная станция, портативная зарядная станция, OUKITEL P5000E PRO, OUKITEL P5000E Pro, Oukitel P5000 Pro, зарядная станция 4000 Вт, зарядная станция 5120 Вт ч, зарядная станция 5120Wh, зарядная станция 5 кВт, зарядная станция 5 кВт ч, зарядная станция LiFePO4, LiFePO4 зарядная станция, мощная зарядная станция, зарядная станция для дома, зарядная станция для квартиры, зарядная станция для блэкаута, зарядная станция при отключении света, резервное питание, резервное питание дома, резервное питание квартиры, аккумуляторная станция, портативная электростанция, автономное питание, зарядная станция 220В, зарядная станция с ИБП, UPS, ИБП для дома, зарядная станция чистая синусоида, зарядная станция для холодильника, зарядная станция для котла, зарядная станция для роутера, зарядная станция для телевизора, зарядная станция для ноутбука, зарядная станция для ПК, зарядная станция для электроинструмента, зарядная станция для насоса, зарядная станция для кемпинга, зарядная станция для солнечных панелей, power station, p</keywords>
<keywords_ua>зарядна станція, портативна зарядна станція, OUKITEL P5000E PRO, OUKITEL P5000E Pro, Oukitel P5000 Pro, зарядна станція 4000 Вт, зарядна станція 5120 Вт год, зарядна станція 5120Wh, зарядна станція 5 кВт, зарядна станція 5 кВт год, зарядна станція LiFePO4, LiFePO4 зарядна станція, потужна зарядна станція, зарядна станція для дому, зарядна станція для квартири, зарядна станція для будинку, зарядна станція для блекауту, зарядна станція при відключенні світла, резервне живлення, резервне живлення будинку, резервне живлення квартири, акумуляторна станція, портативна електростанція, автономне живлення, зарядна станція 220В, зарядна станція з ДБЖ, UPS, ДБЖ для дому, зарядна станція чиста синусоїда, зарядна станція для холодильника, зарядна станція для котла, зарядна станція для роутера, зарядна станція для телевізора, зарядна станція для ноутбука, зарядна станція для ПК, зарядна станція для електроінструменту, зарядна станція для насоса, зарядна станція для кемпінгу, зарядна станція для сонячних панелей, power stat</keywords_ua>
<country_of_origin>Китай</country_of_origin>
<param name="Ширина" unit="мм">299</param>
<param name="Довжина" unit="мм">550</param>
<param name="Вага" unit="кг">53</param>
<param name="Тип">Зарядна станція</param>
<param name="Стан">Новий</param>
<param name="Висота" unit="мм">487</param>
<param name="Особливості">Функція ДБЖ (UPS), Швидке заряджання батареї, З ручкою, З колесами, З управлінням через смартфон</param>
<param name="Колір корпусу">Сірий</param>
<param name="Час зарядки" unit="годин">1.5</param>
<param name="Тип акумулятора">LiFePO4</param>
<param name="Призначення">Для всього будинку</param>
<param name="Матеріал корпусу">Пластик</param>
<param name="Гарантійний термін" unit="міс">12</param>
<param name="Вихідна напруга" unit="В">240</param>
<param name="Ємність акумулятору" unit="мА/год">100000</param>
<param name="Цикли зарядки">5000</param>
<param name="Функція ДБЖ">Так</param>
<param name="Тип (версія) розеток">Європейський</param>
<param name="Роз'єми">USB, Type-C, DC, USB Type-A, XT60, AC</param>
<param name="Місткість зарядної станції, Вт*год">5120</param>
<param name="Максимальна потужність заряджання (220В), Вт">3200</param>
<param name="Максимальна потужність W">7300</param>
<param name="Кількість розеток">5</param>
<param name="Кількість пристроїв, що заряджаються">14</param>
<param name="Країна реєстрації бренда">Китай</param>
<param name="Зарядка батареї">Від мережі, Від сонячної енергія, Від автомобільної зарядки</param>
<param name="Вхідна напруга" unit="В">240</param>
<param name="Вихідні інтерфейси">USB Type A</param>
<param name="Вихідний струм" unit="мА">15000</param>
<param name="Вихідна потужність (загальна), Вт">4000</param>
</offer>
<offer id="EN-BP2000E-PRO" available="true">
<price>{{SALE:54000:55000}}</price>
{{OLD:55000}}
<currencyId>UAH</currencyId>
<categoryId>990004</categoryId>
<picture>https://images.prom.ua/7736686602_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736686603_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736686604_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736686605_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736686832_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736686835_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736686836_zaryadnaya-stantsiya-oukitel.jpg</picture>
<picture>https://images.prom.ua/7736686834_zaryadnaya-stantsiya-oukitel.jpg</picture>
<vendor>Oukitel</vendor>
<vendorCode>BP2000E PRO</vendorCode>
<quantity_in_stock>3</quantity_in_stock>
<name>Зарядная станция OUKITEL BP2000E PRO 3600W 2048Wh LiFePO4, портативная электростанция</name>
<name_ua>Зарядна станція OUKITEL BP2000E PRO 3600W 2048Wh LiFePO4, портативна електростанція</name_ua>
<description><![CDATA[<p><strong>OKITEL BP2000E PRO - мощная портативная зарядная станция с емкостью 2048 Вт*ч и номинальной мощностью 3600 Вт.</strong></p>
<p>Станция оснащена современным аккумулятором&nbsp;<strong>LiFePO4</strong>чистой синусоидой и функцией&nbsp;<strong>ДБЖ (UPS)</strong>&nbsp;с автоматическим переключением до 10 мс. Пиковая мощность достигает&nbsp;<strong>7200 Вт</strong>, поэтому станция подходит для питания как бытовой электроники, так и мощной техники.</p>
<h3 data-section-id="ts3zjk">Основные характеристики:</h3>
<ul>
<li data-section-id="1ihf0kw">Емкость -&nbsp;<strong>2048 Вт*ч</strong></li>
<li data-section-id="5w4e05">Номинальная мощность &mdash;&nbsp;<strong>3600 Вт</strong></li>
<li data-section-id="23hv84">Пиковая мощность &mdash;&nbsp;<strong>7200 Вт</strong></li>
<li data-section-id="eg25an">Аккумулятор &mdash;&nbsp;<strong>LiFePO4</strong></li>
<li data-section-id="12qqq2l">Ресурс &mdash; до&nbsp;<strong>3500 циклов</strong></li>
<li data-section-id="1hl12nj">Чистая синусоида</li>
<li data-section-id="b7jt77">Функция&nbsp;<strong>ДБЖ (UPS)</strong></li>
<li data-section-id="10pm4g9">Переключение на резервное питание &mdash; до&nbsp;<strong>10 мс</strong></li>
<li data-section-id="fzs285">5 розеток AC</li>
<li data-section-id="ket8d4">USB-A и USB-C</li>
<li data-section-id="9zx94v">DC выходы</li>
<li data-section-id="14tqivp">Автомобильный выход</li>
<li data-section-id="6m3et2">Зарядка от сети &mdash; до&nbsp;<strong>1800 Вт</strong></li>
<li data-section-id="1xthh94">Зарядка от солнечных панелей &mdash; до&nbsp;<strong>1000 Вт</strong></li>
<li data-section-id="14tjefk">Управление со смартфона</li>
<li data-section-id="1oz53p">Информационный дисплей</li>
<li data-section-id="pyv0wg">Вес -&nbsp;<strong>26 кг</strong></li>
<li data-section-id="1exjtsl">Размеры -&nbsp;<strong>480 &times; 296 &times; 322 мм</strong></li>
</ul>
<h3 data-section-id="1ojzypi">Для чего подходит</h3>
<p><strong>OUKITEL BP2000E PRO</strong>&nbsp;можно использовать как резервный источник питания для дома, квартиры, офиса и загородного дома.</p>
<p>Станция подходит для питания:</p>
<ul>
<li data-section-id="13fcont">холодильника;</li>
<li data-section-id="quux6d">газового котла;</li>
<li data-section-id="hdkall">роутера;</li>
<li data-section-id="1lqasc7">телевизора;</li>
<li data-section-id="1t9o4ou">ноутбука и ПК;</li>
<li data-section-id="arpg7f">освещение;</li>
<li data-section-id="6yicsw">насоса;</li>
<li data-section-id="10d6cs0">электроинструмента;</li>
<li data-section-id="a8zx5v">другой бытовой техники.</li>
</ul>
<p>Благодаря большой емкости&nbsp;<strong>2048 Вт*ч</strong>&nbsp;станция обеспечивает длительное автономное питание во время отключений электроэнергии.</p>
<h3 data-section-id="jt77v7">Зарядка</h3>
<p>Станцию можно заряжать&nbsp;<strong>от электросети, автомобиля или солнечных панелей</strong>. Мощность зарядки от сети &mdash; до&nbsp;<strong>1800 Вт</strong>, от солнечных панелей &mdash; до&nbsp;<strong>1000 Вт</strong>.</p>
<p data-is-last-node="" data-is-only-node=""><strong>Стан:</strong>&nbsp;новый.<br/>
<strong>Гарантия:</strong>&nbsp;24 месяца.</p>]]></description>
<description_ua><![CDATA[<p><strong>OUKITEL BP2000E PRO &mdash; потужна портативна зарядна станція з ємністю 2048 Вт&middot;год та номінальною потужністю 3600 Вт.</strong></p>
<p>Станція оснащена сучасним акумулятором&nbsp;<strong>LiFePO4</strong>, чистою синусоїдою та функцією&nbsp;<strong>ДБЖ (UPS)</strong>&nbsp;з автоматичним перемиканням до 10 мс. Пікова потужність досягає&nbsp;<strong>7200 Вт</strong>, тому станція підходить для живлення як побутової електроніки, так і потужної техніки.</p>
<h3 data-section-id="ts3zjk">Основні характеристики:</h3>
<ul>
<li data-section-id="1ihf0kw">Ємність &mdash;&nbsp;<strong>2048 Вт&middot;год</strong></li>
<li data-section-id="5w4e05">Номінальна потужність &mdash;&nbsp;<strong>3600 Вт</strong></li>
<li data-section-id="23hv84">Пікова потужність &mdash;&nbsp;<strong>7200 Вт</strong></li>
<li data-section-id="eg25an">Акумулятор &mdash;&nbsp;<strong>LiFePO4</strong></li>
<li data-section-id="12qqq2l">Ресурс &mdash; до&nbsp;<strong>3500 циклів</strong></li>
<li data-section-id="1hl12nj">Чиста синусоїда</li>
<li data-section-id="b7jt77">Функція&nbsp;<strong>ДБЖ (UPS)</strong></li>
<li data-section-id="10pm4g9">Перемикання на резервне живлення &mdash; до&nbsp;<strong>10 мс</strong></li>
<li data-section-id="fzs285">5 розеток AC</li>
<li data-section-id="ket8d4">USB-A та USB-C</li>
<li data-section-id="9zx94v">DC-виходи</li>
<li data-section-id="14tqivp">Автомобільний вихід</li>
<li data-section-id="6m3et2">Заряджання від мережі &mdash; до&nbsp;<strong>1800 Вт</strong></li>
<li data-section-id="1xthh94">Заряджання від сонячних панелей &mdash; до&nbsp;<strong>1000 Вт</strong></li>
<li data-section-id="14tjefk">Керування зі смартфона</li>
<li data-section-id="1oz53p">Інформаційний дисплей</li>
<li data-section-id="pyv0wg">Вага &mdash;&nbsp;<strong>26 кг</strong></li>
<li data-section-id="1exjtsl">Розміри &mdash;&nbsp;<strong>480 &times; 296 &times; 322 мм</strong></li>
</ul>
<h3 data-section-id="1ojzypi">Для чого підходить</h3>
<p><strong>OUKITEL BP2000E PRO</strong>&nbsp;можна використовувати як резервне джерело живлення для будинку, квартири, офісу та заміського будинку.</p>
<p>Станція підходить для живлення:</p>
<ul>
<li data-section-id="13fcont">холодильника;</li>
<li data-section-id="quux6d">газового котла;</li>
<li data-section-id="hdkall">роутера;</li>
<li data-section-id="1lqasc7">телевізора;</li>
<li data-section-id="1t9o4ou">ноутбука та ПК;</li>
<li data-section-id="arpg7f">освітлення;</li>
<li data-section-id="6yicsw">насоса;</li>
<li data-section-id="10d6cs0">електроінструменту;</li>
<li data-section-id="a8zx5v">іншої побутової техніки.</li>
</ul>
<p>Завдяки великій ємності&nbsp;<strong>2048 Вт&middot;год</strong>&nbsp;станція забезпечує тривале автономне живлення під час відключень електроенергії.</p>
<h3 data-section-id="jt77v7">Заряджання</h3>
<p>Станцію можна заряджати&nbsp;<strong>від електромережі, автомобіля або сонячних панелей</strong>. Потужність заряджання від мережі &mdash; до&nbsp;<strong>1800 Вт</strong>, від сонячних панелей &mdash; до&nbsp;<strong>1000 Вт</strong>.</p>
<p data-is-last-node="" data-is-only-node=""><strong>Стан:</strong>&nbsp;новий.<br/>
<strong>Гарантія:</strong>&nbsp;24 місяці.</p>]]></description_ua>
<keywords>зарядная станция, портативная зарядная станция, OUKITEL BP2000E PRO, OUKITEL BP2000E, Oukitel BP2000 Pro, зарядная станция 3600 Вт, зарядная станция 2048 Втч, зарядная станция 2048Wh, зарядная станция 7200 Вт, зарядная станция LiFePO4, LiFeO4 зарядная станция мощная зарядная станция, зарядная станция для дома, зарядная станция для квартиры, зарядная станция для блэкаута, зарядная станция при отключении света, резервное питание, резервное питание для дома, резервное питание квартиры, аккумуляторная станция, портативная электростанция, автономное питание, зарядная станция 220В, зарядная станция с ИБП, ИБП, UPS, зарядная станция чистая синусоида, зарядная станция для холодильника, зарядная станция для котла, зарядная станция для роутера, зарядная станция для телевизора, зарядная станция для ноутбука, зарядная станция для ПК, зарядная станция для насоса, зарядная станция для электроинструмента, зарядная станция для освещения, зарядная станция для солнечных панелей, зарядная станция 5 кВт, power station, portable</keywords>
<keywords_ua>зарядна станція, портативна зарядна станція, OUKITEL BP2000E PRO, OUKITEL BP2000E, Oukitel BP2000 Pro, зарядна станція 3600 Вт, зарядна станція 2048 Вт год, зарядна станція 2048Wh, зарядна станція 7200 Вт, зарядна станція LiFePO4, LiFePO4 зарядна станція, потужна зарядна станція, зарядна станція для дому, зарядна станція для квартири, зарядна станція для будинку, зарядна станція для блекауту, зарядна станція при відключенні світла, резервне живлення, резервне живлення для дому, резервне живлення квартири, акумуляторна станція, портативна електростанція, автономне живлення, зарядна станція 220В, зарядна станція з ДБЖ, ДБЖ, UPS, зарядна станція чиста синусоїда, зарядна станція для холодильника, зарядна станція для котла, зарядна станція для роутера, зарядна станція для телевізора, зарядна станція для ноутбука, зарядна станція для ПК, зарядна станція для насоса, зарядна станція для електроінструменту, зарядна станція для освітлення, зарядна станція для сонячних панелей, зарядна станція 5 кВт, power station, port</keywords_ua>
<country_of_origin>Китай</country_of_origin>
<param name="Ширина" unit="мм">296</param>
<param name="Довжина" unit="мм">480</param>
<param name="Вага" unit="кг">26</param>
<param name="Тип">Зарядна станція</param>
<param name="Стан">Новий</param>
<param name="Висота" unit="мм">322</param>
<param name="Особливості">Функція ДБЖ (UPS), Швидке заряджання батареї, З управлінням через смартфон</param>
<param name="Колір корпусу">Сірий</param>
<param name="Час зарядки" unit="годин">1.5</param>
<param name="Тип акумулятора">LiFePO4</param>
<param name="Призначення">Для всього будинку</param>
<param name="Матеріал корпусу">Пластик</param>
<param name="Гарантійний термін" unit="міс">24</param>
<param name="Вихідна напруга" unit="В">240</param>
<param name="Ємність акумулятору" unit="мА/год">40000</param>
<param name="Цикли зарядки">3500</param>
<param name="Функція ДБЖ">Так</param>
<param name="Тип (версія) розеток">Європейський</param>
<param name="Роз'єми">USB, Type-C, DC, USB Type-A, Розетка AC 220В</param>
<param name="Місткість зарядної станції, Вт*год">2048</param>
<param name="Максимальна потужність заряджання (220В), Вт">1800</param>
<param name="Максимальна потужність W">7200</param>
<param name="Кількість розеток">5</param>
<param name="Кількість пристроїв, що заряджаються">15</param>
<param name="Країна реєстрації бренда">Китай</param>
<param name="Зарядка батареї">Від мережі, Від сонячної енергія, Від автомобільної зарядки</param>
<param name="Вхідна напруга" unit="В">240</param>
<param name="Вихідні інтерфейси">USB Type C</param>
<param name="Вихідний струм" unit="мА">15000</param>
<param name="Вихідна потужність (загальна), Вт">3600</param>
</offer>
<offer id="EN-UPS-DC1018P" available="true">
<price>{{SALE:1614:1899}}</price>
{{OLD:1899}}
<currencyId>UAH</currencyId>
<categoryId>990005</categoryId>
<picture>https://images.prom.ua/7736780023_ibp-ups-dc1018p.jpg</picture>
<picture>https://images.prom.ua/7736780293_ibp-ups-dc1018p.jpg</picture>
<picture>https://images.prom.ua/7736780301_ibp-ups-dc1018p.jpg</picture>
<picture>https://images.prom.ua/7736780303_ibp-ups-dc1018p.jpg</picture>
<picture>https://images.prom.ua/7736780299_ibp-ups-dc1018p.jpg</picture>
<vendor>DC</vendor>
<vendorCode>ДБЖ UPS DC1018P</vendorCode>
<quantity_in_stock>5</quantity_in_stock>
<name>ИБП UPS DC1018P 10400mAh для роутера и ONU, Mini UPS 5V/9V/12V/15V/24V, USB POE LAN</name>
<name_ua>ДБЖ UPS DC1018P 10400mAh для роутера та ONU, Mini UPS 5V/9V/12V/15V/24V, USB POE LAN</name_ua>
<description><![CDATA[<p><strong>Mini UPS DC1018P 10400mAh &mdash; источник бесперебойного питания для роутера, ONU/GPON, модема и другого сетевого оборудования.</strong></p>
<p>DC1018P помогает поддерживать работу совместимого оборудования при отключении электроэнергии. При исчезновении сетевого питания устройство автоматически переходит на встроенный аккумулятор, а после восстановления электроэнергии возвращается к питанию от сети. Переключение происходит без задержки заявленной для данной модели в виде 0 мс.&nbsp;</p>
<h3 data-section-id="14zdxpx">Основные преимущества</h3>
<ul>
<li data-section-id="1nhyfaf">аккумулятор&nbsp;<strong>10400 мАч</strong>;</li>
<li data-section-id="127pldt">максимальная выходная мощность&nbsp;<strong>18 Вт</strong>;</li>
<li data-section-id="x8gpkn">выходы&nbsp;<strong>5V / 9V / 12V</strong>;</li>
<li data-section-id="1e1h9ag">USB&nbsp;<strong>5V/2A</strong>;</li>
<li data-section-id="1tf3ds4">POE&nbsp;<strong>15V/24V</strong>;</li>
<li data-section-id="628a94">поддержка подключения роутера и ONU/GPON;</li>
<li data-section-id="1bhm2rq">LAN/RJ45;</li>
<li data-section-id="m74u6x">автоматическое переключение на аккумулятор;</li>
<li data-section-id="1typmok">холодный старт;</li>
<li data-section-id="r1rk1h">автоматическое восстановление работы после появления электроэнергии;</li>
<li data-section-id="xbny3s">LED индикация уровня заряда;</li>
<li data-section-id="1nsslcf">защита от короткого замыкания, перегрузки, перезарядки и переразряда;</li>
<li data-section-id="u2jgbw">компактный корпус.</li>
</ul>
<p>DC1018P может использоваться для&nbsp;<strong>Wi-Fi роутеров, оптических терминалов ONU/GPON, модемов, камер видеонаблюдения и другого совместимого оборудования постоянного тока</strong>.&nbsp;</p>
<h3 data-section-id="1oe9l8b">Выходы</h3>
<p><strong>DC 5V:</strong>&nbsp;до 2A<br/>
<strong>DC 9V:</strong>&nbsp;до 1A<br/>
<strong>DC 12V:</strong>&nbsp;до 1A<br/>
<strong>USB:</strong>&nbsp;5V/2A<br/>
<strong>POE:</strong>&nbsp;15V или 24V, до 0.6A</p>
<p>Перед подключением обязательно проверьте&nbsp;<strong>напряжение, полярность, тип разъема и необходимый ток</strong>&nbsp;вашего оборудования. Для POE необходимо установить соответствующее значение 15V или 24V.&nbsp;</p>
<h3 data-section-id="fu5i7j">Характеристики</h3>
<ul>
<li data-section-id="1r08dvd">Модель:&nbsp;<strong>DC1018P</strong></li>
<li data-section-id="jsl4aw">Тип:&nbsp;<strong>Mini UPS / ДБЖ / Power Bank</strong></li>
<li data-section-id="1n2138k">Емкость:&nbsp;<strong>10400 мАч</strong></li>
<li data-section-id="h7qq3d">Тип аккумулятора:&nbsp;<strong>Li-Ion</strong></li>
<li data-section-id="dy8554">Количество аккумуляторов:&nbsp;<strong>4 &times; 2600 мАч</strong></li>
<li data-section-id="ec7hb4">Максимальная мощность:&nbsp;<strong>18 Вт</strong></li>
<li data-section-id="1g0vq83">Входное напряжение:&nbsp;<strong>85&ndash;265V AC</strong></li>
<li data-section-id="oaazcf">Частота:&nbsp;<strong>50&ndash;60 Гц</strong></li>
<li data-section-id="1q0boat">DC 5V:&nbsp;<strong>2A</strong></li>
<li data-section-id="1kfdz56">DC 9V:&nbsp;<strong>1A</strong></li>
<li data-section-id="1v0u3m8">DC 12V:&nbsp;<strong>1A</strong></li>
<li data-section-id="1g4ggq1">USB:&nbsp;<strong>5V/2A</strong></li>
<li data-section-id="1qtj2iq">POE:&nbsp;<strong>15V/24V, 0,6A</strong></li>
<li data-section-id="1dzg2k7">Время переключения:&nbsp;<strong>0 мс</strong></li>
<li data-section-id="p5tpag">Время полной зарядки:&nbsp;<strong>до 2 годин</strong></li>
<li data-section-id="c8zpde">Размер:&nbsp;<strong>160 &times; 105 &times; 33 мм</strong></li>
<li data-section-id="1nw38vz">Вес:&nbsp;<strong>около 0.4 кг</strong></li>
<li data-section-id="8vdhni">Цвет:&nbsp;<strong>черный</strong></li>
<li data-section-id="uy2dsg">Страна производства:&nbsp;<strong>Китай</strong></li>
</ul>
<h3 data-section-id="biu120">Комплектация</h3>
<ul>
<li data-section-id="1oluznd">Mini UPS DC1018P;</li>
<li data-section-id="1qm1tsn">кабель питания;</li>
<li data-section-id="1y903b4">DC-кабель;</li>
<li data-section-id="1kjvkba">DC разветвитель для подключения двух устройств;</li>
<li data-section-id="1o0tvfs">инструкция.</li>
</ul>]]></description>
<description_ua><![CDATA[<p><strong>Mini UPS DC1018P 10400mAh &mdash; джерело безперебійного живлення для роутера, ONU/GPON, модема та іншого мережевого обладнання.</strong></p>
<p>DC1018P допомагає підтримувати роботу сумісного обладнання під час відключення електроенергії. При зникненні мережевого живлення пристрій автоматично переходить на вбудований акумулятор, а після відновлення електроенергії повертається до живлення від мережі. Перемикання відбувається без затримки, заявленої для цієї моделі як 0 мс.&nbsp;</p>
<h3 data-section-id="14zdxpx">Основні переваги</h3>
<ul>
<li data-section-id="1nhyfaf">акумулятор&nbsp;<strong>10400 мАг</strong>;</li>
<li data-section-id="127pldt">максимальна вихідна потужність&nbsp;<strong>18 Вт</strong>;</li>
<li data-section-id="x8gpkn">виходи&nbsp;<strong>5V / 9V / 12V</strong>;</li>
<li data-section-id="1e1h9ag">USB&nbsp;<strong>5V/2A</strong>;</li>
<li data-section-id="1tf3ds4">POE&nbsp;<strong>15V/24V</strong>;</li>
<li data-section-id="628a94">підтримка підключення роутера та ONU/GPON;</li>
<li data-section-id="1bhm2rq">LAN/RJ45;</li>
<li data-section-id="m74u6x">автоматичне перемикання на акумулятор;</li>
<li data-section-id="1typmok">холодний старт;</li>
<li data-section-id="r1rk1h">автоматичне відновлення роботи після появи електроенергії;</li>
<li data-section-id="xbny3s">LED-індикація рівня заряду;</li>
<li data-section-id="1nsslcf">захист від короткого замикання, перевантаження, перезаряджання та перерозряджання;</li>
<li data-section-id="u2jgbw">компактний корпус.</li>
</ul>
<p>DC1018P може використовуватися для&nbsp;<strong>Wi-Fi роутерів, оптичних терміналів ONU/GPON, модемів, камер відеоспостереження та іншого сумісного обладнання постійного струму</strong>.&nbsp;</p>
<h3 data-section-id="1oe9l8b">Виходи</h3>
<p><strong>DC 5V:</strong>&nbsp;до 2A<br/>
<strong>DC 9V:</strong>&nbsp;до 1A<br/>
<strong>DC 12V:</strong>&nbsp;до 1A<br/>
<strong>USB:</strong>&nbsp;5V/2A<br/>
<strong>POE:</strong>&nbsp;15V або 24V, до 0,6A</p>
<p>Перед підключенням обов&#39;язково перевірте&nbsp;<strong>напругу, полярність, тип роз&#39;єму та необхідний струм</strong>&nbsp;вашого обладнання. Для POE необхідно встановити відповідне значення 15V або 24V.&nbsp;</p>
<h3 data-section-id="fu5i7j">Характеристики</h3>
<ul>
<li data-section-id="1r08dvd">Модель:&nbsp;<strong>DC1018P</strong></li>
<li data-section-id="jsl4aw">Тип:&nbsp;<strong>Mini UPS / ДБЖ / Power Bank</strong></li>
<li data-section-id="1n2138k">Ємність:&nbsp;<strong>10400 мАг</strong></li>
<li data-section-id="h7qq3d">Тип акумулятора:&nbsp;<strong>Li-Ion</strong></li>
<li data-section-id="dy8554">Кількість акумуляторів:&nbsp;<strong>4 &times; 2600 мАг</strong></li>
<li data-section-id="ec7hb4">Максимальна потужність:&nbsp;<strong>18 Вт</strong></li>
<li data-section-id="1g0vq83">Вхідна напруга:&nbsp;<strong>85&ndash;265V AC</strong></li>
<li data-section-id="oaazcf">Частота:&nbsp;<strong>50&ndash;60 Гц</strong></li>
<li data-section-id="1q0boat">DC 5V:&nbsp;<strong>2A</strong></li>
<li data-section-id="1kfdz56">DC 9V:&nbsp;<strong>1A</strong></li>
<li data-section-id="1v0u3m8">DC 12V:&nbsp;<strong>1A</strong></li>
<li data-section-id="1g4ggq1">USB:&nbsp;<strong>5V/2A</strong></li>
<li data-section-id="1qtj2iq">POE:&nbsp;<strong>15V/24V, 0,6A</strong></li>
<li data-section-id="1dzg2k7">Час перемикання:&nbsp;<strong>0 мс</strong></li>
<li data-section-id="p5tpag">Час повного заряджання:&nbsp;<strong>до 2 годин</strong></li>
<li data-section-id="c8zpde">Розмір:&nbsp;<strong>160 &times; 105 &times; 33 мм</strong></li>
<li data-section-id="1nw38vz">Вага:&nbsp;<strong>близько 0,4 кг</strong></li>
<li data-section-id="8vdhni">Колір:&nbsp;<strong>чорний</strong></li>
<li data-section-id="uy2dsg">Країна виробництва:&nbsp;<strong>Китай</strong></li>
</ul>
<h3 data-section-id="biu120">Комплектація</h3>
<ul>
<li data-section-id="1oluznd">Mini UPS DC1018P;</li>
<li data-section-id="1qm1tsn">кабель живлення;</li>
<li data-section-id="1y903b4">DC-кабель;</li>
<li data-section-id="1kjvkba">DC-розгалужувач для підключення двох пристроїв;</li>
<li data-section-id="1o0tvfs">інструкція.</li>
</ul>]]></description_ua>
<keywords>ДБЖ для роутера, UPS для роутера, безперебійник для роутера, ДБЖ для WiFi роутера, UPS для WiFi роутера, Mini UPS, Mini UPS для роутера, DC1018P, DC1018P 10400mAh, повербанк для роутера, Power Bank UPS, ДБЖ 10400 мАг, UPS 10400mAh, ДБЖ 18W, UPS 18W, ДБЖ 5V 9V 12V, UPS 5V 9V 12V, ИБП 15V 24V, UPS POE 15V 24V, ИБП для ONU, UPS для ONU, ИБП для GPON, UPS для GPON, ИБП для модема, бесперебойное питание роутера, бесперебойное питание ONU, резервное питание роутера, резервное питание интернета, ИБП с PO, UPS с POE, ИБП USB, UPS USB, ИБП LAN, UPS LAN, ИБП для оптики, ИБП для интернета, павербанк для модема, аккумулятор для роутера</keywords>
<keywords_ua>ДБЖ для роутера, UPS для роутера, безперебійник для роутера, ДБЖ для WiFi роутера, UPS для WiFi роутера, Mini UPS, Mini UPS для роутера, DC1018P, DC1018P 10400mAh, повербанк для роутера, Power Bank UPS, ДБЖ 10400 мАг, UPS 10400mAh, ДБЖ 18W, UPS 18W, ДБЖ 5V 9V 12V, UPS 5V 9V 12V, ДБЖ 15V 24V, UPS POE 15V 24V, ДБЖ для ONU, UPS для ONU, ДБЖ для GPON, UPS для GPON, ДБЖ для модема, безперебійне живлення роутера, безперебійне живлення ONU, резервне живлення роутера, резервне живлення інтернету, ДБЖ з POE, UPS з POE, ДБЖ USB, UPS USB, ДБЖ LAN, UPS LAN, ДБЖ для оптики, ДБЖ для інтернету, павербанк для модема, акумулятор для роутера</keywords_ua>
<country_of_origin>Китай</country_of_origin>
<param name="Ширина" unit="мм">105</param>
<param name="Довжина" unit="мм">160</param>
<param name="Вага" unit="кг">0.4</param>
<param name="Стан">Новий</param>
<param name="Висота" unit="мм">33</param>
<param name="Колір корпусу">Чорний</param>
<param name="Час зарядки" unit="годин">2</param>
<param name="Тип акумулятора">Li-Ion</param>
<param name="Матеріал корпусу">Пластик</param>
<param name="Колір">Синій</param>
<param name="Захист від перегріву">Так</param>
<param name="Гарантійний термін" unit="міс">3</param>
<param name="Вихідна напруга" unit="В">12</param>
<param name="Ємність акумулятору" unit="мАг">10400</param>
<param name="Захист від короткого замикання">Так</param>
<param name="Частота струму" unit="Гц">50</param>
<param name="Час перемикання" unit="мс">0</param>
<param name="Тип монтажу">Поверхневий</param>
<param name="Тип запобіжника">Автоматичний</param>
<param name="Тип ДБЖ">Лінійно-інтерактивний (Line-Interactive)</param>
<param name="Сумісність з типом АКБ">Li-Ion</param>
<param name="Призначення / Застосування">Для роутера / модему / камер</param>
<param name="Наявність холодного старту">Так</param>
<param name="Наявність PoE виходу">Є PoE вихід</param>
<param name="Наявність MPPT контролера">Без MPPT</param>
<param name="Напруга акумулятору" unit="В">3.7</param>
<param name="Мінімальна вхідна напруга" unit="В">100</param>
<param name="Максимальна потужність" unit="Вт">18</param>
<param name="Максимальна вхідна напруга" unit="В">240</param>
<param name="Кількість вхідних розеток" unit="шт.">1</param>
<param name="Захист від переполюсовки">Так</param>
<param name="Захист від перевантаження">Так</param>
<param name="Додатковий акумулятор">Ні</param>
<param name="Вихідна потужність" unit="Вт">18</param>
<param name="Автоматичне регулювання напруги">Так</param>
<param name="Інтерфейс для підключення зовнішніх пристроїв">LAN (Ethernet), DC, RJ-45</param>
<param name="Індикація">Світлова</param>
</offer>
`;
// Категорії додаткових товарів, які НЕ йдуть у жоден фід (Prom, Rozetka, Епіцентр).
// 14.10.2026: зарядні станції Oukitel (990004) знято з продажу. Щоб повернути — прибрати id зі списку.
const EXTRA_HIDE_CATS = ['990001', '990003', '990004', '990005']; // 16.10.2026: інвертор, електроковдри, станції, ДБЖ — прибрано з усіх фідів
function extraHidden_(id) { return EXTRA_HIDE_CATS.indexOf(String(id)) > -1; }
function extraCats_() {
  return EXTRA_CATEGORIES_XML.replace(/<category id="(\d+)">[^<]*<\/category>\s*/g, function (c, id) { return extraHidden_(id) ? '' : c; });
}
function extraOffers_() {
  const today = Utilities.formatDate(new Date(), 'Europe/Kiev', 'yyyy-MM-dd');
  const saleOn = today <= EXTRA_SALE_UNTIL;
  return EXTRA_OFFERS_XML
    .replace(/<offer\b[^>]*>[\s\S]*?<\/offer>\s*/g, function (o) {
      const c = (o.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
      return extraHidden_(c) ? '' : o;
    })
    .replace(/\{\{SALE:(\d+):(\d+)\}\}/g, function (_, s, full) { return saleOn ? s : full; })
    .replace(/\{\{OLD:(\d+)\}\}/g, function (_, full) { return saleOn ? '<oldprice>' + full + '</oldprice>' : ''; });
}
function addExtra_(xml) {
  return xml
    .replace('</categories>', extraCats_() + '</categories>')
    .replace('</offers>', extraOffers_() + '</offers>');
}
// ===== /ДОДАТКОВІ ТОВАРИ =====

// ===== ДОДАТКОВІ ТОВАРИ → ROZETKA та ЕПІЦЕНТР (08.10.2026) =====
// Ті самі 10 товарів з EXTRA_OFFERS_XML. Ціни — як у файлі (без націнки маркетплейсів).
// Rozetka: категорії з rz_id (ID категорій Rozetka). Епіцентр: набори атрибутів і коди значень з довідників Епіцентру.
const EXTRA_RZ_CATS = { '990001': 4639256, '990002': 132896, '990003': 4669207, '990004': 4674585, '990005': 80108 };

function extraTag_(o, t) { const m = o.match(new RegExp('<' + t + '>([\\s\\S]*?)</' + t + '>')); return m ? m[1] : ''; }

function addExtraRz_(xml) {
  const cats = extraCats_().replace(/<category id="(\d+)">/g, function (a, id) {
    return EXTRA_RZ_CATS[id] ? '<category id="' + id + '" rz_id="' + EXTRA_RZ_CATS[id] + '">' : a;
  });
  const offers = extraOffers_().replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const price = extraTag_(body, 'price');
    const old = extraTag_(body, 'oldprice');
    const art = extraTag_(body, 'vendorCode');
    body = body
      .replace(/<oldprice>[^<]*<\/oldprice>\s*/, '')
      .replace(/<price>[^<]*<\/price>/, '<price>' + price + '</price>\n<price_old>' + (old || price) + '</price_old>')
      .replace(/<quantity_in_stock>([^<]*)<\/quantity_in_stock>/, '<stock_quantity>$1</stock_quantity>')
      .replace(/<vendorCode>([^<]*)<\/vendorCode>/, '<vendorCode>$1</vendorCode>\n<article>' + art + '</article>')
      .replace(/<keywords(_ua)?>[\s\S]*?<\/keywords(_ua)?>\s*/g, '')
      .replace(/<country_of_origin>([^<]*)<\/country_of_origin>/, '<param name="Країна-виробник товару">$1</param>');
    return '<offer' + attrs + '>' + body + '</offer>';
  });
  return xml.replace('</categories>', cats + '</categories>').replace('</offers>', offers + '</offers>');
}

// Епіцентр: S — код набору/категорії; pk — упаковка (мм, г); p — обов'язкові/додаткові атрибути.
// Формат p: [назва, paramcode, valuecode або '', значення]
const EPI_EXTRA = {
  'EN-001': { S: '8704', T: 'Автомобільні інвертори', brand: 'UKC', pk: [60, 170, 110, 560], p: [
    ['Потужність', '8305', '', '500'], ['Вид', '12732', '827418e877dad06299e88a4a4b3aa5c1', 'інвертор'],
    ['Вхідна напруга', '5920', '', '12'], ['Вихідна напруга', '5929', '', '220']] },
  'EN-JAM1876': { S: '1525', T: 'Бігові доріжки', brand: 'JAM', pk: [1050, 1260, 530, 22000], p: [
    ['Довжина полотна', '13722', '', '114'], ['Ширина полотна', '9068', '', '40'],
    ['Максимальна вага користувача', '4196', '', '130'], ['Система навантаження', '4486', '6b0a9ede60eb5e16dcb3889cb541692b', 'електрична'],
    ['Максимальна швидкість бігового полотна', '4490', '', '12'], ['Наявність регулювання кута нахилу', '10149', 'no', 'ні']] },
  'EN-2018547-4': { S: '136', T: 'Постільна білизна з підігрівом', brand: 'No Name', pk: [140, 240, 340, 3000], p: [
    ['Призначення', '534', 'ef129121dcdcb428e37bbc48785ceaf9', 'для дому'], ['Живлення', '237', 'fc11d61490ca85c046d79cec66acc8b2', 'від мережі 230 В'],
    ['Колір виробника', '78', 'nlmlmqnr', 'рожевий'], ['Висота', '110', '', '150'], ['Ширина', '111', '', '120'],
    ['Тип', '530', 'b58985024bcb2123dd88f74077bd84ad', 'електроковдра'], ['Розмір', '3977', '776b2ddf5e3c9afecfd0d65acf96bace', '150x120'],
    ['Базовий колір', '12097', 'af5820f4d82201e791b5ec6b99869faf', 'рожевий']] },
  'EN-2018547-3': { S: '136', T: 'Постільна білизна з підігрівом', brand: 'No Name', pk: [140, 240, 340, 3000], p: [
    ['Призначення', '534', 'ef129121dcdcb428e37bbc48785ceaf9', 'для дому'], ['Живлення', '237', 'fc11d61490ca85c046d79cec66acc8b2', 'від мережі 230 В'],
    ['Колір виробника', '78', 'ophru6z8', 'білий'], ['Висота', '110', '', '150'], ['Ширина', '111', '', '120'],
    ['Тип', '530', 'b58985024bcb2123dd88f74077bd84ad', 'електроковдра'], ['Розмір', '3977', '776b2ddf5e3c9afecfd0d65acf96bace', '150x120'],
    ['Базовий колір', '12097', 'cb8a8dc6861023bc621f964a491c94d4', 'білий']] },
  'EN-2018547-2': { S: '136', T: 'Постільна білизна з підігрівом', brand: 'No Name', pk: [140, 240, 340, 3000], p: [
    ['Призначення', '534', 'ef129121dcdcb428e37bbc48785ceaf9', 'для дому'], ['Живлення', '237', 'fc11d61490ca85c046d79cec66acc8b2', 'від мережі 230 В'],
    ['Колір виробника', '78', 'nlmlmqnr', 'рожевий'], ['Висота', '110', '', '150'], ['Ширина', '111', '', '120'],
    ['Тип', '530', 'b58985024bcb2123dd88f74077bd84ad', 'електроковдра'], ['Розмір', '3977', '776b2ddf5e3c9afecfd0d65acf96bace', '150x120'],
    ['Базовий колір', '12097', 'af5820f4d82201e791b5ec6b99869faf', 'рожевий']] },
  'EN-P1000E-PLUS': { S: '8484', T: 'Зарядні станції', brand: 'Oukitel', pk: [238, 346, 228, 12000], p: [
    ['Ємність', '6999', '27a02e477937ab2e11f8712876dcf079', '1000 - 1499'], ['Ємність', '321', '', '1024'],
    ['Призначення', '802', 'zo11vvlyfa487kaj,g2qqixtidypko6kr', 'універсальна,для будинку'],
    ['Зарядка', '1110', 'f100734d339a8c6a98681885faed9ae1,32ffb3e3a3eb199cd84a675ad36a5dd3,fe37f4484d2ef0b2ed971521274c6e7d', 'розетка,сонячна панель,автомобільний адаптер'],
    ['Тип', '50', '9xoswlqmwssqk7k6', 'зарядна станція'], ['Тип акумулятора', '7358', 'c3a006b354a738f20de2e8a38bb56089', 'LiFePO4'],
    ['Розмір', '5413', '0b15758878635043c8510038ef5f3c69', 'середній'], ['Кількість вихідних портів', '8822', '', '11'],
    ['Вихідна потужність', '5462', '', '1800'], ['Пікова вихідна потужність', '2257', '', '3600']] },
  'EN-P2001E-Plus': { S: '8484', T: 'Зарядні станції', brand: 'Oukitel', pk: [320, 399, 286, 22000], p: [
    ['Ємність', '6999', '44e25ddbe373d962851b6b0762080725', '2000 - 2499'], ['Ємність', '321', '', '2048'],
    ['Призначення', '802', 'zo11vvlyfa487kaj,g2qqixtidypko6kr', 'універсальна,для будинку'],
    ['Зарядка', '1110', 'f100734d339a8c6a98681885faed9ae1,32ffb3e3a3eb199cd84a675ad36a5dd3,fe37f4484d2ef0b2ed971521274c6e7d', 'розетка,сонячна панель,автомобільний адаптер'],
    ['Тип', '50', '9xoswlqmwssqk7k6', 'зарядна станція'], ['Тип акумулятора', '7358', 'c3a006b354a738f20de2e8a38bb56089', 'LiFePO4'],
    ['Розмір', '5413', '0adbdcd689fa7d85d3960f2b421bbfee', 'великий'], ['Кількість вихідних портів', '8822', '', '13'],
    ['Вихідна потужність', '5462', '', '2400'], ['Пікова вихідна потужність', '2257', '', '4800']] },
  'EN-P5000E-PRO': { S: '8484', T: 'Зарядні станції', brand: 'Oukitel', pk: [487, 550, 299, 53000], p: [
    ['Ємність', '6999', '764bae7238212ab10f81ee650f487b16', 'більш ніж 2500'], ['Ємність', '321', '', '5120'],
    ['Призначення', '802', 'zo11vvlyfa487kaj,g2qqixtidypko6kr', 'універсальна,для будинку'],
    ['Зарядка', '1110', 'f100734d339a8c6a98681885faed9ae1,32ffb3e3a3eb199cd84a675ad36a5dd3,fe37f4484d2ef0b2ed971521274c6e7d', 'розетка,сонячна панель,автомобільний адаптер'],
    ['Тип', '50', '9xoswlqmwssqk7k6', 'зарядна станція'], ['Тип акумулятора', '7358', 'c3a006b354a738f20de2e8a38bb56089', 'LiFePO4'],
    ['Розмір', '5413', '0adbdcd689fa7d85d3960f2b421bbfee', 'великий'], ['Кількість вихідних портів', '8822', '', '14'],
    ['Вихідна потужність', '5462', '', '4000'], ['Пікова вихідна потужність', '2257', '', '8000']] },
  'EN-BP2000E-PRO': { S: '8484', T: 'Зарядні станції', brand: 'Oukitel', pk: [322, 480, 296, 26000], p: [
    ['Ємність', '6999', '44e25ddbe373d962851b6b0762080725', '2000 - 2499'], ['Ємність', '321', '', '2048'],
    ['Призначення', '802', 'zo11vvlyfa487kaj,g2qqixtidypko6kr', 'універсальна,для будинку'],
    ['Зарядка', '1110', 'f100734d339a8c6a98681885faed9ae1,32ffb3e3a3eb199cd84a675ad36a5dd3,fe37f4484d2ef0b2ed971521274c6e7d', 'розетка,сонячна панель,автомобільний адаптер'],
    ['Тип', '50', '9xoswlqmwssqk7k6', 'зарядна станція'], ['Тип акумулятора', '7358', 'c3a006b354a738f20de2e8a38bb56089', 'LiFePO4'],
    ['Розмір', '5413', '0adbdcd689fa7d85d3960f2b421bbfee', 'великий'], ['Кількість вихідних портів', '8822', '', '15'],
    ['Вихідна потужність', '5462', '', '3600'], ['Пікова вихідна потужність', '2257', '', '7200']] },
  'EN-UPS-DC1018P': { S: '183', T: 'Джерела безперебійного живлення', brand: 'DC', pk: [33, 160, 105, 400], p: [
    ['Призначення ДБЖ', '13571', '58b5119f3e55df67d070272a608804a8', 'для роутера'], ['Вихідна потужність (повна)', '1693', '', '18'],
    ['Тип товару', '6340', 'ab5e06dbb7d2dae4d8b36ca125027616', 'джерела безперебійного живлення'],
    ['Базовий колір', '12097', '3ec160321d45b95cf3a540ad3a2bf896', 'чорний'],
    ['Особливості ДБЖ', '793', '8elrfxzo,cp9z3vn4,jkfkioxb', 'холодний старт,захист від перевантаження,захист від короткого замикання']] }
};
// Коди брендів у довіднику Епіцентру (заповнено з довідника; порожньо — бренду в довіднику немає).
const EPI_EXTRA_BRANDS = { 'UKC': 'dc0abb4b0de748c3b1c1d77851d9e7d1', 'DC': 't9grc8gyxjtchodq', 'JAM': '4drfig87ybcknhcz', 'Oukitel': 'e0c739eb44b04c838916adaace8920f0', 'No Name': '755b97b05db04c338a1d7eeaaca523ad' };

function extraEpiOffers_() {
  const out = [];
  extraOffers_().replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
    const c = EPI_EXTRA[id]; if (!c) return all;
    const avail = /available="true"/.test(attrs) ? 'true' : 'false';
    const art = extraTag_(body, 'vendorCode');
    const pics = (body.match(/<picture>[\s\S]*?<\/picture>/g) || []).slice(0, 15).join('\n');
    const bcode = EPI_EXTRA_BRANDS[c.brand];
    let o = '<offer id="' + art + '" available="' + avail + '">\n<price>' + extraTag_(body, 'price') + '</price>\n' +
      '<category code="' + c.S + '">' + c.T + '</category>\n<attribute_set code="' + c.S + '">' + c.T + '</attribute_set>\n' +
      '<name lang="ua">' + extraTag_(body, 'name_ua') + '</name>\n<name lang="ru">' + extraTag_(body, 'name') + '</name>\n' + pics + '\n' +
      '<description lang="ua">' + extraTag_(body, 'description_ua') + '</description>\n<description lang="ru">' + extraTag_(body, 'description') + '</description>\n' +
      (bcode ? '<vendor code="' + bcode + '">' + xmlEsc_(c.brand) + '</vendor>\n' : '') +
      '<country_of_origin code="chn">Китай</country_of_origin>\n' +
      '<param name="Міра виміру" paramcode="measure" valuecode="measure_pcs">шт.</param>\n' +
      '<param name="Мінімальна кратність товару" paramcode="ratio">1</param>\n' +
      '<param name="Висота" paramcode="height">' + c.pk[0] + '</param>\n<param name="Глибина" paramcode="length">' + c.pk[1] + '</param>\n' +
      '<param name="Ширина" paramcode="width">' + c.pk[2] + '</param>\n<param name="Вага" paramcode="weight">' + c.pk[3] + '</param>\n';
    c.p.forEach(function (x) {
      o += '<param name="' + xmlEsc_(x[0]) + '" paramcode="' + x[1] + '"' + (x[2] ? ' valuecode="' + x[2] + '"' : '') + '>' + xmlEsc_(x[3]) + '</param>\n';
    });
    out.push(o + '</offer>');
    return all;
  });
  return out;
}
// ===== /ДОДАТКОВІ ТОВАРИ → ROZETKA та ЕПІЦЕНТР =====

// ================== ДОРЕЧІ → МАРКЕТПЛЕЙСИ (08.10.2026) ==================
// Товари ДоРечі додаються у фід сайту «на льоту» (лише для маркетплейсів; на сайті їх поки немає).
// Тексти й фото — з фіду ДоРечі; ціна сайту = РРЦ, залишки — з онлайн-прайсу ДоРечі (Google-таблиця).
// Далі вони проходять ті самі обробки, що й MagBaby: Prom, Kasta, Rozetka, Епіцентр.
// Ціна маркетплейсу = РРЦ + комісія маркетплейсу (MP_MARKUP), див. mpPrice_.
// Артикул фіду зіставляється з прайсом за правилами drMatch_; якщо збігу немає — товар пропускається (нічого не вгадуємо).
// Якщо фід або прайс ДоРечі недоступні — товари ДоРечі тимчасово не потрапляють у фіди (решта фідів працює як завжди).
// f=dorechireport -> звіт: скільки товарів зіставлено, скільки в наявності, що пропущено.
const DR_FEED = '';
const DR_SHEET = 'https://docs.google.com/spreadsheets/d/1DU8uF_VH4aO1FURXuu-mvtzzC5QJWhGy0l2gO0nYPVw/export?format=csv&gid=';
const DR_GIDS = ['273495408', '0'];
const DR_VENDOR = 'ДоРечі';
// Категорія ДоРечі -> категорія сайту LETIMO. Масив = [регулярка за назвою, категорія] (перший збіг), рядок = одна категорія.
const DR_CATS = {
  '1055': '1140', // Сонцезахисні козирки -> Аксесуари для колясок
  '1058': '1131', // Конверти Тренд -> Конверти для новонароджених
  '1059': '1131', // Кокони Baby XS -> Конверти для новонароджених
  '1072': [[/пінетк/i, '1103'], [/рукавич/i, '1088']],
  '1076': '1091', // Демі куртки / вітровки -> Верхній одяг
  '1078': '1140', // Матрасики -> Аксесуари для колясок
  '1079': '1135', '1080': '1135', '1081': '1135', '1085': '1135', // Комбінезони, напівкомбінезони
  '1082': '1140', '1083': '1140', // Муфти -> Аксесуари для колясок
  '1087': [[/снуд|шарф/i, '1122'], [/шапк|капор|берет|панам/i, '1128']],
  '1092': '1108' // Пледи -> Пледи та покривала
};
const DR_COLORS = [[/м'ят|мят/, "м'ятний"], [/біл/, 'білий'], [/молочн/, 'молочний'], [/графіт/, 'графітовий'], [/сір/, 'сірий'], [/чорн/, 'чорний'],
  [/беж/, 'бежевий'], [/лат(т)?е/, 'кавовий'], [/карамел/, 'карамельний'], [/пудр/, 'пудровий'], [/рожев/, 'рожевий'],
  [/блакит/, 'блакитний'], [/син(ій|я|ього|і|е)(?![а-яіїєґ])/, 'синій'], [/зелен/, 'зелений'], [/оливк/, 'оливковий'], [/хакі/, 'хакі'],
  [/коричн|шоколад/, 'коричневий'], [/червон/, 'червоний'], [/бордо/, 'бордовий'], [/жовт|гірчич/, 'жовтий'], [/лаванд|бузк/, 'бузковий']];
function drIsArt_(art) { return /^DR-/.test(String(art || '').trim()); }

function drNorm_(s) {
  return String(s || '').toUpperCase().replace(/О/g, 'O').replace(/А/g, 'A').replace(/С/g, 'C').replace(/_/g, '/').replace(/\s+/g, ' ').trim();
}
function drCsv_(t) {
  return t.split(/\r?\n/).map(function (l) {
    const o = []; let c = '', q = false;
    for (let i = 0; i < l.length; i++) { const ch = l[i]; if (ch === '"') q = !q; else if (ch === ',' && !q) { o.push(c); c = ''; } else c += ch; }
    o.push(c); return o;
  });
}
function drPrices_() {
  const map = {};
  DR_GIDS.forEach(function (g) {
    const r = UrlFetchApp.fetch(DR_SHEET + g, { muteHttpExceptions: true, followRedirects: true });
    if (r.getResponseCode() !== 200) throw new Error('ДоРечі прайс gid ' + g + ' HTTP ' + r.getResponseCode());
    drCsv_(r.getContentText('UTF-8')).forEach(function (c) {
      const art = drNorm_(c[0]); const drop = parseFloat(c[2]); const rrc = parseFloat(c[3]);
      if (!art || !(drop > 0) || !(rrc > 0)) return;
      map[art] = { name: String(c[1] || '').trim(), drop: drop, rrc: rrc, av: String(c[4] || '').trim().toLowerCase(), st: parseInt(c[7], 10) || 0 };
    });
  });
  return map;
}
function drMatch_(id, pr) {
  const n = drNorm_(id);
  const tries = [n, n.replace(/ N$/, ''), n.replace(/ ON$/, ' O'), n.replace(/ F$/, ''), n.replace(/ FON?$/, ' FO')];
  for (let i = 0; i < tries.length; i++) if (pr[tries[i]]) return tries[i];
  return null;
}
function drClean_(html) {
  return String(html || '')
    .replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, '$1')
    .replace(/https?:\/\/\S*dorechi\S*/gi, '')
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\]\]>/g, ']]&gt;');
}
function drSize_(name) {
  const s = String(name);
  let m = s.match(/(\d{2,3}\s*[\/\-]\s*\d{2,3})(?!\d)/);
  if (m) return m[1].replace(/\s+/g, '');
  m = s.match(/\s(\d{2,3})(\s*\([^)]*\))?\s*$/); // «... 104», «... 14 (0-18м)»
  return m ? (m[1] + (m[2] ? ' ' + m[2].trim() : '')) : '';
}
function drHash_(s) { let h = 7; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9000000; return h; }
function drGroup_(priceName, size) {
  // модель = назва з прайсу без розміру (різні фасони з одним кодом не змішуються)
  return String(80000000 + drHash_(String(priceName).replace(size, '').replace(/\s+/g, ' ').trim().toLowerCase()));
}
function drSiteCat_(cat, name) {
  const r = DR_CATS[cat];
  if (!r) return '';
  if (typeof r === 'string') return r;
  const hit = r.filter(function (x) { return x[0].test(name); })[0];
  return hit ? hit[1] : '';
}
function drColor_(name) {
  const s = String(name).toLowerCase();
  const hit = DR_COLORS.filter(function (x) { return x[0].test(s); })[0];
  return hit ? hit[1] : '';
}

let DR_CACHE_ = null;
// Повертає { offers: [XML пропозицій у форматі фіду сайту], rep: звіт }
// ===== ДоРечі: запасні описи, якщо в фіді постачальника опис порожній (10.10.2026) =====
// Факти — з офіційних сторінок dorechi.ua (розділи «Аполло», «Муфти на флісі», «Матрасики», «Куртки та вітровки»).
const DR_DESC_FALLBACK = [
  [/аполло/i, '<p>Зимовий комбінезон «Аполло» від українського виробника ДоРечі — мембранний комбінезон для малюків, які вже ходять і граються на снігу.</p><ul><li>Мембрана: водонепроникність 7 000 мм, паропроникність 5 000 г/м². Не продувається вітром, захищає від мокрого снігу та дощу, а дитина не перегрівається під час активних ігор.</li><li>Утеплювач Hollowsoft™ 300 г/м² — теплий, легкий, не вбирає вологу й відновлює форму після прання.</li><li>Груди та спинка — фліс Polar, рукави й штанини — гладкий атлас, щоб комбінезон легко вдягався.</li><li>Світловідбивні елементи з усіх боків, анатомічний капюшон, резинка на талії.</li></ul><p>Розмір — за зростом дитини, вказаним у назві. Під комбінезон зазвичай достатньо термобілизни з бавовни або вовни: мембрана працює найкраще, коли дитина не пітніє.</p>'],
  [/муфта на флісі/i, '<p>Муфта на коляску від українського виробника ДоРечі з флісовою підкладкою — легка, тепла й практична.</p><ul><li>Тепла флісова підкладка.</li><li>Можна прати в пральній машині.</li><li>Багато кольорів і принтів — легко підібрати в тон до конверта чи коляски.</li></ul>'],
  [/матрасик/i, '<p>Двосторонній матрасик-вкладка в коляску від українського виробника ДоРечі — для комфортних літніх прогулянок.</p><ul><li>Тканина — преміум котон (100% бавовна): дихає, тож малюк менше пітніє в спеку.</li><li>Захищає сидіння коляски від забруднення та вигоряння.</li><li>Дві сторони різного кольору та принту — можна змінювати вигляд коляски.</li><li>Розрахований на більшість прогулянкових колясок.</li></ul>'],
  [/вітровк/i, '<p>Дитяча вітровка від українського виробника ДоРечі — для теплої весни, осені та літніх вечорів.</p><ul><li>Майже невагома: поміститься навіть у маленьку сумку «на всяк випадок».</li><li>Бавовняна підкладка на грудях і спинці.</li><li>Захищає від вітру.</li></ul><p>Як підібрати розмір: орієнтуйтеся на зріст дитини та залиште запас 2–4 см.</p>']
];
function drDescFallback_(name) {
  for (let i = 0; i < DR_DESC_FALLBACK.length; i++) if (DR_DESC_FALLBACK[i][0].test(name)) return DR_DESC_FALLBACK[i][1];
  return '';
}
// ===== /ДоРечі: запасні описи =====

function drOffers_() {
  if (DR_CACHE_) return DR_CACHE_;
  const xml = drFeedXml_(); // 04.11.2026: з резервною копією (fast.gs)
  const pr = drPrices_();
  const rep = { feed: 0, ok: 0, inStock: 0, noMatch: [], noCat: [], groups: 0, byCat: {} };
  const groupsSeen = {}, ids = {}, offers = [], byArt = {};
  xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    rep.feed++;
    const fid = (attrs.match(/\bid="([^"]+)"/) || [])[1] || '';
    const key = drMatch_(fid, pr);
    if (!key) { rep.noMatch.push(fid); return all; }
    const p = pr[key];
    const name = ((body.match(/<name>([\s\S]*?)<\/name>/) || [])[1] || p.name).replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, '').trim();
    const fcat = (body.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1] || '';
    const cat = drSiteCat_(fcat, name);
    if (!cat) { rep.noCat.push(fid + ' ' + name.slice(0, 40)); return all; }
    const qty = p.av === 'є' && p.st > 0 ? p.st : 0;
    const desc = drClean_((body.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '') || drDescFallback_(name);
    const pics = (body.match(/<picture>[^<]*<\/picture>/g) || []).slice(0, 15);
    const size = drSize_(p.name);
    const gid = drGroup_(p.name, size);
    groupsSeen[gid] = 1;
    const drArt = 'DR-' + key.replace(/[\s\/]+/g, '-');
    let id = 90000000 + drHash_(drArt); while (ids[id]) id++; ids[id] = 1;
    const sizeTxt = /^\d{2,3}([\/\-]\d{2,3})?$/.test(size) ? size + ' см' : size;
    const fullName = (name + (sizeTxt ? ' ' + sizeTxt : '')).replace(/\]\]>/g, '');
    const color = drColor_(name) || (fcat === '1055' && !/фарби/i.test(name) ? 'чорний' : ''); // козирки без «Фарби» — чорні (з опису)
    let o = '<offer id="' + id + '" group_id="' + gid + '" available="' + (qty > 0 ? 'true' : 'false') + '">\n';
    o += '<price>' + Math.round(p.drop * 2) + '</price>\n<currencyId>UAH</currencyId>\n<categoryId>' + cat + '</categoryId>\n';
    o += pics.join('\n') + '\n';
    o += '<vendorCode>' + xmlEsc_(drArt) + '</vendorCode>\n<vendor>' + DR_VENDOR + '</vendor>\n';
    o += '<name><![CDATA[' + fullName + ']]></name>\n<description><![CDATA[' + desc + ']]></description>\n';
    o += '<name_ua><![CDATA[' + fullName + ']]></name_ua>\n<description_ua><![CDATA[' + desc + ']]></description_ua>\n';
    if (color) o += '<param name="Цвет">' + color + '</param>\n';
    if (size) o += '<param name="Розмір">' + xmlEsc_(cat === '1128' && /^\d{2}(-\d{2})?$/.test(size) ? size + 'см' : size) + '</param>\n'; // шапки: обхват голови, см
    o += '<param name="Країна виробник">Україна</param>\n';
    o += '<quantity_in_stock>' + qty + '</quantity_in_stock>\n';
    o += '</offer>';
    offers.push(o);
    byArt[drArt] = { fcat: fcat, cat: cat, name: name, size: size, color: color, d: desc.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').toLowerCase() };
    rep.ok++; if (qty > 0) rep.inStock++;
    rep.byCat[cat] = (rep.byCat[cat] || 0) + 1;
    return all;
  });
  rep.groups = Object.keys(groupsSeen).length;
  if (rep.ok < 50) throw new Error('ДоРечі: зіставлено лише ' + rep.ok + ' товарів — не додаю');
  DR_CACHE_ = { offers: offers, rep: rep, byArt: byArt };
  return DR_CACHE_;
}

// Додає товари ДоРечі у фід сайту (перед усіма обробками маркетплейсів).
function drAdd_(xml) {
  try { return xml.replace('</offers>', drOffers_().offers.join('\n') + '\n</offers>'); }
  catch (e) { Logger.log('ДоРечі пропущено: ' + e.message); return xml; }
}
function drReport_() {
  const r = drOffers_().rep;
  return JSON.stringify(Object.assign({}, r, { noMatchCount: r.noMatch.length, noCatCount: r.noCat.length }), null, 1);
}
// ДоРечі → Епіцентр (08.10.2026): значення обов'язкових полів, взяті з опису та назви товару ДоРечі.
// Розмірні сітки й вік — з описів ДоРечі: Baby XS «від народження до 9-10 місяців», довжина 75 см -> зріст 52–70;
// Тренд «від 6 місяців до 3х років» -> зріст 68–98; рукавички «довжина 14 см»; плед «80х100 см».
// Повертає масив значень або null (тоді працює загальна логіка epiDerive_). Значення беруться лише ті, що є в довіднику.
// Коди «Колір виробника» (поле 78, коди спільні для всіх наборів) — довідник має >40 сторінок, загальна логіка бачить лише перші 40.
const DR_EPI_COLOR78 = {'білий':'ophru6z8', 'молочний':'m1ibfybx', 'графітовий':'707e0ea60cbf93e48a8c4b07709c0653', 'сірий':'gsyiryzw', 'чорний':'ff8cwdpi', 'бежевий':'e3fyw7jf', 'кавовий':'zkpqfywqduirb8ow', 'карамельний':'iokxhcklet8dbp3t', 'пудровий':'594b7a1e1904e', 'рожевий':'nlmlmqnr', 'блакитний':'u2rqrf0q', 'синій':'roiaf3xb', 'зелений':'kd4hovsb', 'оливковий':'e6zxjitn', 'хакі':'2jxjeu2a', 'коричневий':'zbjmtjbl', 'червоний':'5uooq3p5', 'бордовий':'hbac10n7', 'жовтий':'ji7xemhv', 'бузковий':'qkbujlc3', "м'ятний":'yy1ake56ui0sqzfu', 'принт':'591f86e85126e', 'різнокольоровий':'hbrprb2v'};
const DR_PRINTS = /чарівний ліс|леопард|мамонт|перший сніг|галявин|комікс|динозавр|машинк|малюнк|фарби|плям|акварел|африк|киці/i;
function drEpiCtx_(art) {
  if (!drIsArt_(art) || !DR_CACHE_ || !DR_CACHE_.byArt) return null;
  return DR_CACHE_.byArt[art] || null;
}
function drSeason_(d) {
  const n = d.name.toLowerCase();
  if (/^(1058|1059|1079|1080|1082|1083|1085)$/.test(d.fcat)) return ['осінь', 'зима'];
  if (d.fcat === '1081') return ['демісезон', 'весна', 'осінь'];
  if (d.fcat === '1076') return /вітровк/.test(n) ? ['весна', 'літо', 'осінь'] : ['демісезон', 'весна', 'осінь'];
  if (d.fcat === '1055' || d.fcat === '1078') return ['літо'];
  if (/зимов|мериноса/.test(n)) return ['осінь', 'зима'];
  if (/демісезон/.test(n)) return ['демісезон', 'весна', 'осінь'];
  return null;
}
function drEpiVals_(a, ctx, opts) {
  const d = ctx.dr, n = String(a.n).toLowerCase(), nm = d.name.toLowerCase();
  const pick = function (arr) { const r = (arr || []).filter(function (v) { return !!opts[v]; }); return r.length ? r : null; };
  const print = DR_PRINTS.test(d.name) || !d.color;
  if (/^візерунок/.test(n)) return print ? pick(['з малюнком', 'принт']) : pick(['без візерунка (однотонний)']);
  if (/^колір/.test(n)) return d.color ? pick([d.color]) : pick(['принт', 'різнокольоровий']);
  if (/^базовий колір/.test(n)) return d.color ? null : pick(['різнокольоровий']);
  if (/^сезон/.test(n)) return pick(drSeason_(d));
  if (d.fcat === '1059') { // кокон Baby XS
    if (/^вид/.test(n)) return pick(['конверт-кокон', 'утеплені']);
    if (/^зріст/.test(n)) return pick(['52–70']);
  }
  if (d.fcat === '1080' && /^зріст/.test(n)) return pick(['56', '62', '68', '74']); // Діскавері: «56-74 см» (категорія ДоРечі), «до зросту 74 см»
  if (d.fcat === '1058') { // конверт Тренд
    if (/^вид/.test(n)) return pick(['конверт для прогулянок', 'утеплені']);
    if (/^зріст/.test(n)) return pick(['68–74', '74–80', '80-92', '92-98']);
  }
  if (/^матеріал$/.test(n) && (d.fcat === '1058' || d.fcat === '1059')) {
    const m = [];
    if (/мембранн|плащов/.test(d.d)) m.push('плащова тканина');
    if (/фліс/.test(d.d)) m.push('фліс');
    if (/штучн\S* хутр/.test(d.d)) m.push('штучне хутро');
    return pick(m);
  }
  if (/^тип$/.test(n)) {
    if (d.cat === '1128' && /шапк/.test(nm)) return pick(['шапочка']);
    if (/козир/.test(nm)) return pick(['козирок']);
    if (/муфт/.test(nm)) return pick(['муфта']);
  }
  if (/^вік дитини/.test(n) && /козир|муфт/.test(nm)) return pick(['від народження']); // козирки: «люльки і прогулянкові блоки»
  if (/^розмір/.test(n) && d.cat === '1088') { const m = d.d.match(/довжина (\d{2}) см/); return m ? pick([m[1]]) : null; }
  if (d.cat === '1108') {
    const m = d.d.match(/(\d{2,3})\s*[хx]\s*(\d{2,3})\s*см/);
    if (/^розмір/.test(n) && m) return pick([m[1] + 'x' + m[2] + ' см', m[1] + 'х' + m[2] + ' см']);
    if (/^тип тканини/.test(n)) { const t = []; if (/бавовн/.test(d.d)) t.push('бавовна'); if (/акрил/.test(d.d)) t.push('акрил'); return pick(t); }
  }
  if (/^особлив/.test(n)) { // лише з назви: в описах ДоРечі овчину згадують для порівняння
    if (d.fcat === '1081') return pick(['з довгими рукавами']) || [];
    return pick([/овчин/.test(nm) ? 'на овчині' : '', /фліс/.test(nm) ? 'на флісі' : '']) || [];
  }
  return null;
}
// ===== /ДОРЕЧІ =====

const COLOR_RULES = [
  [/клітин|клітк|горош|зірочк|ластівк|сакур|лимончик|гілочк|квіт|смуж|смугаст|принт|трояндоч|мультик|різнокол|джинс|єнот|такса|ананас|зайч|рибк|русалк|левен|машинк|сафарі|коник|зебр|space|кит|качк|собачк|єдиноріг|donut|авокадо|fries|eggs|watermelon|cocktail|монстр|космос|краб|листоч|жолуд|ведмед|жираф|півон|волошк|лео|селезень|голубка|каченят|папорот|морквин|моркви|серця|трикутник|кавун|слоник|фламінго|коала|хамелеон|лінивец|веселк|тюльпан|полунич|круасан|равлик|хвил|фрукт/, 'Різні кольори'],
  [/фукс/, 'Фуксія'],
  [/бордо|вишнев|винн|марсал/, 'Бордовий'],
  [/малинов|червон|цеглян/, 'Червоний'],
  [/теракот/, 'Теракотовий'],
  [/рожев|пудров|персиков|лосос|троянд|корал/, 'Рожевий'],
  [/лілов|аметист|фіолет|лаванд|бузков|ірис/, 'Фіолетовий'],
  [/бірюз|ментол|м'ятн/, 'Бірюзовий'],
  [/блакит|сиз|небесн|лазур|голуб/, 'Блакитний'],
  [/синій|синя|індиго|індіго|сапфір|морськ/, 'Синій'],
  [/салатов|фісташ/, 'Салатовий'],
  [/хакі|олив|лавров/, 'Хакі'],
  [/зелен|смараг/, 'Зелений'],
  [/жовт|лимон|банан|гірчич/, 'Жовтий'],
  [/помаранч|оранж/, 'Помаранчевий'],
  [/графіт|сірий|сіра|сіре|сірі|меланж|грі$|грі |попел/, 'Сірий'],
  [/чорн/, 'Чорний'],
  [/молоч|слонов|вершков|ваніл|білий|біла|білі|айвор|кремов/, 'Білий'],
  [/коричн|шоколад|мокко|умбр|темний таш|каштан|какао/, 'Коричневий'],
  [/беж|капучин|пісоч|карамел|таш|горіх|кавов/, 'Бежевий']
];

function baseColor_(c) {
  const s = String(c || '').toLowerCase();
  for (let i = 0; i < COLOR_RULES.length; i++) if (COLOR_RULES[i][0].test(s)) return COLOR_RULES[i][1];
  return 'Різні кольори';
}

function xmlEsc_(s) {
  return String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function markup_(price, comm) {
  return Math.ceil(parseFloat(price) / (1 - comm / 100));
}

// ================== PROM: ціна = ціна 1 MagBaby + 18% (рішення 04.10.2026) ==================
// Тільки для Prom (doGet без параметра і prom.xml). Kasta/Rozetka не зачіпаються.
// Ключ: модель у лапках (малими) | ціна на сайті -> ціна 1 з каталогу MagBaby (Catalogue 21).
// Якщо товару немає в таблиці — ціна лишається як на сайті.
const PROM_MARKUP = 18;
const P1 = {'base|299': 245, 'strip|602': 490, 'loony|2077': 1490, 'fler|2445': 1990, 'mila|572': 465, 'terry|378': 310, /* 07.10.2026: з каталогу MagBaby осінь-зима 2026 */ 'abel|119': 95, 'abel|1549': 1260, 'abel|2765': 2250, 'abel|80': 65, 'adam|2799': 2280, 'aida|529': 430, 'aida|755': 620, 'aldo|1467': 1195, 'alice|596': 485, 'allar|1217': 990, 'amelia|1592': 1295, 'andreo|793': 645, 'anry|1063': 865, 'apple|272': 245, 'aria|1449': 1180, 'ari|2912': 2370, 'ari|3422': 2785, 'ari|532': 425, 'ava|428': 345, 'averi|301': 245, 'baloo|4651': 3785, 'baloo|933': 745, 'barbara|1346': 1095, 'base|301': 245, 'base|572': 470, 'basic|399': 325, 'bear|1094': 890, 'bear|294': 260, 'beris|1032': 840, 'beris|3666': 2990, 'berry|486': 395, 'bird|272': 245, 'bomber|2198': 1790, 'bonny|2317': 1895, 'bon|870': 695, 'buff|916': 745, 'carlo|964': 785, 'charlotte|1592': 1295, 'cloud|2320': 1890, 'colin|1309': 1065, 'cozy|1100': 895, 'cozy|151': 120, 'cozy|620': 555, 'cozy|664': 595, 'cozy|854': 695, 'dario|547': 445, 'diego|303': 245, 'direct|565': 460, 'doria|1346': 1095, 'dutta|2060': 1685, 'elephant|327': 295, 'emeri|113': 90, 'emeri|4034': 3290, 'emeri|523': 425, 'emeri|610': 540, 'emeri|670': 545, 'emeri|80': 65, 'emoji|558': 445, 'eric|1217': 990, 'evelyn|1210': 980, 'everett|2431': 1980, 'field|1469': 1195, 'field|1784': 1495, 'field|2132': 1795, 'fler|2446': 1990, 'fluffy|140': 115, 'growing|1088': 885, 'honey|277': 225, 'honey|406': 330, 'honey|586': 525, 'honey|631': 565, 'iro|688': 560, 'isla|1099': 895, 'ivy|3545': 2885, 'james|1039': 845, 'jazz|1180': 960, 'jeremy|1234': 990, 'jeremy|1445': 1160, 'kamil|560': 460, 'kappi|664': 595, 'kappi|854': 695, 'kinsley|1940': 1580, 'klood|1160': 940, 'knot|370': 295, 'koala|294': 260, 'korin|2414': 1975, 'kori|326': 265, 'lace|1223': 995, 'lace|1895': 1595, 'leon|1063': 865, 'letty|1063': 890, 'liam|854': 695, 'lint|1390': 1170, 'lion|272': 245, 'lizzie|1099': 890, 'loony|1831': 1490, 'louise|713': 580, 'lucas|1223': 995, 'lucas|1895': 1595, 'lui|2198': 1890, 'madoo|870': 695, 'marco|3668': 2985, 'marco|566': 460, 'marco|828': 680, 'marshmallow|503': 445, 'mary|2451': 1995, 'mellow|3422': 2785, 'merely|119': 95, 'merely|793': 645, 'metal|334': 295, 'metal|548': 485, 'michel|1536': 1250, 'milan|1708': 1390, 'milly|854': 695, 'mitten|845': 685, 'muzzle|317': 260, 'nail|2262': 1850, 'natural|934': 760, 'neo|733': 585, 'nikola|3299': 2685, 'nikola|4159': 3385, 'noemi|1094': 890, 'noemi|2433': 1980, 'nory|1708': 1390, 'olivia|1714': 1395, 'paco|848': 690, 'pair|1180': 960, 'pair|1467': 1195, 'panda|181': 160, 'panda|250': 225, 'panda|317': 280, 'panda|520': 460, 'patrick|494': 445, 'piptic|720': 575, 'pixy|495': 395, 'pocket|565': 460, 'polin|2182': 1785, 'pompon|1032': 865, 'pooh|4037': 3285, 'pop|3299': 2685, 'purl|608': 545, 'purl|642': 575, 'rainy plus|1938': 1585, 'richard|467': 380, 'richard|682': 560, 'ring|327': 295, 'rio|3668': 2985, 'ronny|558': 445, 'rubber|317': 260, 'ruby|558': 445, 'rum|2931': 2385, 'rut|1829': 1490, 'rut|854': 695, 'scales|1696': 1380, 'scales|2079': 1750, 'scales|547': 445, 'sharlen|609': 495, 'shining|558': 445, 'simply|181': 160, 'simply|217': 195, 'simply|250': 225, 'simply|317': 280, 'simply|492': 435, 'sofia|1087': 885, 'spunky|1831': 1490, 'spunky|916': 745, 'star|1093': 890, 'stormy|1693': 1385, 'strip|586': 525, 'strip|603': 490, 'strip|631': 565, 'strip|842': 685, 'teddy|4037': 3285, 'ted|572': 460, 'ted|833': 665, 'terry|195': 160, 'tim|2200': 1790, 'tim|2931': 2385, 'tim|495': 395, 'tim|965': 785, 'tino|970': 790, 'torino|363': 295, 'trudy|1063': 865, 'trudy|119': 95, 'trudy|586': 525, 'trudy|631': 565, 'trudy|793': 645, 'trudy|80': 65, 'verner|793': 645, 'victoria|2689': 2190, 'viola|2206': 1795, 'viven|424': 345, 'wafel|985': 895, 'warm|439': 360, 'waterproof|1333': 1090, 'wild flowers|1592': 1295, 'wild flowers|1784': 1495, 'wild flowers|2132': 1795, 'wind|586': 525, 'wind|631': 565, 'yumi|977': 780, 'zuma|4037': 3285, 'каспер|748': 670, 'каспер|871': 780, 'сірий меланж|631': 565};

function promBase_(name, price) {
  const q = (String(name).match(/["«“„]([^"»”“]+)["»”“]/) || [])[1];
  if (!q) return null;
  return P1[q.trim().toLowerCase() + '|' + Math.round(parseFloat(price))] || null;
}

function promPrices_(xml) {
  return xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const nm = (body.match(/<name_ua>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name_ua>/) ||
                body.match(/<name>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name>/) || [])[1] || '';
    const sp = (body.match(/<price>([\d.]+)<\/price>/) || [])[1];
    const base = sp ? promBase_(nm, sp) : null;
    if (!base) return all;
    const np = Math.round(base * (1 + PROM_MARKUP / 100));
    body = body
      .replace(/<oldprice>([\d.]+)<\/oldprice>/, function (_, o) { return '<oldprice>' + Math.round(parseFloat(o) * np / parseFloat(sp)) + '</oldprice>'; })
      .replace(/<price>[\d.]+<\/price>/, '<price>' + np + '</price>');
    return '<offer' + attrs + '>' + body + '</offer>';
  });
}

function testPromPrices() {
  const src = buildFeed_();
  const out = promPrices_(src);
  const a = src.match(/<price>[\d.]+<\/price>/g) || [], b = out.match(/<price>[\d.]+<\/price>/g) || [];
  let changed = 0, bear = '';
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) changed++;
  const offers = out.match(/<offer\b[\s\S]*?<\/offer>/g) || [];
  for (let i = 0; i < offers.length; i++) if (offers[i].indexOf('чоловічок "Bear"') >= 0) { bear = (offers[i].match(/<price>([\d.]+)</) || [])[1]; break; }
  Logger.log('Пропозицій: ' + a.length + ', змінено ціну: ' + changed + ', Bear: ' + bear);
}


// 17.10.2026: ручні правки Дмитра на Prom — фід їх не перетирає (ключ = артикул без розміру)
const TV_STOCK = { 'TV-05293-BIL': 2, 'TV-05293-PUDRA': 2, 'TV-05293-TPUDRA': 2, 'TV-05293-KOR': 1, 'TV-04844-PERS': 2 }; // решта Talvi = 1
// 18.10.2026: штрихкоди Talvi (внутрішні коди Talvi, префікс 200 — тільки Prom/Kasta, НЕ як GTIN у Google). Ключ = id товару Horoshop.
const TV_BARCODE = {6081:'2000000528274',6082:'2000000528199',6083:'2000000528076',6084:'2000000528106',6085:'2000000526096',6086:'2000000526126',6087:'2000000684819',6088:'2000000315768',6089:'2000000401737',6090:'2000000434902',6091:'2000000408149',6092:'2000000530857',6093:'2000000503424',6094:'2000000503462',6095:'2000000351896',6096:'2000000342191',6097:'2000000401966',6098:'2000000517094',6099:'2000000539126',6101:'2000000539225',6102:'2000000539287',6103:'2000000539157',6104:'2000000539133',6105:'2000000539201',6106:'2000000550428',6107:'2000000550466',6108:'2000000653327',6109:'2000000653358',6110:'2000000653310',6111:'2000000657035'};
function tvBarcode_(xml) {
  return xml.replace(/<offer id="(\d+)"[\s\S]*?<\/offer>/g, function (o, id) {
    const bc = TV_BARCODE[id];
    if (!bc || /<barcode>/.test(o)) return o;
    return o.replace('</offer>', '<barcode>' + bc + '</barcode>\n</offer>');
  });
}
const PROM_OVERRIDES = {
  'HA828-3-PINK': { pics: [
    'https://images.prom.ua/7798560198_w640_h640_detskie-zimnie-botinki.jpg',
    'https://images.prom.ua/7798560200_w640_h640_detskie-zimnie-botinki.jpg',
    'https://images.prom.ua/7798560235_w640_h640_detskie-zimnie-botinki.jpg'] }
};

function convertOffer_(attrs, body) {
  const cat = (body.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
  const col = (body.match(/<param name="Цвет">([^<]*)<\/param>/) || [])[1];
  let sz = (body.match(/<param name="Розмір">([^<]*)<\/param>/) || [])[1];
  body = body.replace(/<param name="Цвет">[^<]*<\/param>\s*/, '').replace(/<param name="Розмір">[^<]*<\/param>\s*/, '');
  let add = '';
  // 16.10.2026: взуття (розділ 1168) — розмір і колір з назви, бо експорт Horoshop не віддає param «Розмір»
  if (cat === '1168') {
    const nm = (body.match(/<name_ua>(?:<!\[CDATA\[)?([^<\]]*)/) || body.match(/<name>(?:<!\[CDATA\[)?([^<\]]*)/) || [])[1] || '';
    if (!sz) sz = (nm.match(/розмір\s*(\d{2})/i) || [])[1];
    const SHOE_COL = [[/black/i, 'Чорний'], [/beige/i, 'Бежевий'], [/fuchsia/i, 'Рожевий'], [/camel|коричнев/i, 'Коричневий'], [/pink/i, 'Рожевий'], [/white|біл/i, 'Білий']];
    if (!col) { for (let i = 0; i < SHOE_COL.length; i++) { if (SHOE_COL[i][0].test(nm)) { add += '<param name="Колір">' + SHOE_COL[i][1] + '</param>\n'; break; } } }
    if (body.indexOf('<param name="Країна виробник"') < 0) add += '<param name="Країна виробник">' + (/American\s*Club/i.test((body.match(/<vendor>([\s\S]*?)<\/vendor>/) || ['', ''])[1]) ? 'Польща' : 'Китай') + '</param>\n'; // 24.10.2026: American Club — Польща (Selfy)
  }
  if (col) {
    add += '<param name="Колір">' + baseColor_(col) + '</param>\n';
    add += '<param name="Відтінок">' + xmlEsc_(col) + '</param>\n';
  }
  if (sz) {
    const m = sz.match(/^(\d{2,3})(\s*\(|$)/);
    if (cat && CLOTHING.indexOf(cat) >= 0 && m) add += '<param name="' + SIZE_CHAR + '">' + m[1] + '</param>\n';
    else if (cat === '1168') add += '<param name="Розмір взуття">' + xmlEsc_(sz) + '</param>\n'; // 16.10: окрема характеристика, бо в «Размер» на Prom криві значення (2/3, 26")
    else add += '<param name="Розмір">' + xmlEsc_(sz) + '</param>\n';
  }
  if (body.indexOf('<param name="Країна виробник"') < 0 && /<vendor>MagBaby<\/vendor>/.test(body)) {
    add += '<param name="Країна виробник">Україна</param>\n';
  }
  const ovArt = ((body.match(/<vendorCode>(?:<!\[CDATA\[)?\s*([^<\]\s]+)/) || [])[1] || '').replace(/-\d+$/, '');
  const ov = PROM_OVERRIDES[ovArt];
  if (ov) {
    if (ov.price) body = body.replace(/<price>[^<]*<\/price>/, '<price>' + ov.price + '</price>').replace(/<oldprice>[^<]*<\/oldprice>\s*/, '');
    if (ov.pics) { body = body.replace(/<picture>[^<]*<\/picture>\s*/g, ''); add += ov.pics.map(function (u) { return '<picture>' + u + '</picture>\n'; }).join(''); }
  }
    // Talvi: кількість з накладної 12.10.2026 (Horoshop не має поля залишку)
    if (/^TV-/.test(ovArt) && !/<quantity_in_stock>/.test(body)) { const tvq = TV_STOCK[ovArt] != null ? TV_STOCK[ovArt] : 1; add += '<quantity_in_stock>' + tvq + '</quantity_in_stock>\n'; }
  if (APPLY_COMMISSION) {
    const comm = cat && COMM[cat] != null ? COMM[cat] : DEFAULT_COMM;
    body = body
      .replace(/<price>([\d.]+)<\/price>/, function (_, p) { return '<price>' + markup_(p, comm) + '</price>'; })
      .replace(/<oldprice>([\d.]+)<\/oldprice>/, function (_, p) { return '<oldprice>' + markup_(p, comm) + '</oldprice>'; });
  }
  if (/available="true"/.test(attrs)) {
    if (!/in_stock=/.test(attrs)) attrs += ' in_stock="true"';
    if (body.indexOf('<quantity_in_stock>') < 0 && add.indexOf('<quantity_in_stock>') < 0) add += '<quantity_in_stock>' + STOCK_QTY + '</quantity_in_stock>\n';
  }
  return '<offer' + attrs + '>' + body + add + '</offer>';
}

function buildFeed_() {
  const res = srcRes_(); // 04.11.2026: читання експорту шматками
  if (res.getResponseCode() !== 200) throw new Error('Horoshop feed HTTP ' + res.getResponseCode());
  const xml = promOwnSale_(toysPromPrice_(addExtra_(mpPrices_(drAdd_(res.getContentText('UTF-8')), MP_PCT_))));
  const conv = xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    return convertOffer_(attrs, body);
  });
  return mainInStock_(conv);
}

// Prom вважає основним товаром групи ПЕРШИЙ різновид у файлі. Якщо він не в наявності —
// уся картка показується «Немає в наявності» і не потрапляє в каталог.
// Тому першим у групі ставимо перший різновид, який є в наявності.
function mainInStock_(xml) {
  const re = /<offer\b[^>]*>[\s\S]*?<\/offer>/g;
  const offers = xml.match(re) || [];
  const first = {}, main = {};
  offers.forEach(function (o, i) {
    const g = (o.match(/^<offer\b[^>]*group_id="([^"]+)"/) || [])[1];
    if (!g) return;
    if (first[g] == null) first[g] = i;
    if (main[g] == null && /^<offer\b[^>]*available="true"/.test(o)) main[g] = i;
  });
  const moveTo = {}, skip = {};
  Object.keys(first).forEach(function (g) {
    if (main[g] != null && main[g] !== first[g]) { moveTo[first[g]] = main[g]; skip[main[g]] = true; }
  });
  let i = -1;
  return xml.replace(re, function (o) {
    i++;
    if (skip[i]) return '';
    if (moveTo[i] != null) return offers[moveTo[i]] + '\n' + o;
    return o;
  });
}

// ===== PROM: УЗГОДЖЕННЯ РІЗНОВИДІВ — додано 10.10.2026 =====
// Prom приймає різновид, лише якщо його характеристики є і в основного (першого в group_id) товару,
// а різновиди відрізняються максимум 3 характеристиками. promEnrich_ бере параметри MagBaby окремо
// для кожного різновиду за назвою, тому «Сезон»/«Тип тканини» тощо в групі розходились → 868 відмов.
// Тут: усі НЕрізновидні характеристики в групі = як в основного товару; «Сезон»/«Тип тканини»
// дописуються основному, якщо їх немає; повні дублі прибираються; фото ≤ 10; порожній опис UA ← RU.
// Застосовується ТІЛЬКИ до фіду Prom (doGet без f і publishJob_('prom')).
const PF_MAX_PICTURES = 10;
const PF_VARIANT_PARAMS = ['Колір', 'Відтінок', 'Розмір дитячого одягу (за зростом)', 'Розмір', 'Розмір взуття'];
const PF_SEASON_ROOTS = ['1157', '1087', '1085', '1168']; // Одяг; Головні убори та аксесуари; Виписка та хрещення
const PF_FABRIC_ROOTS = ['1157', '1085'];         // Одяг; Виписка та хрещення
// Значення — точно зі списку Prom «Тип тканини». Перевірка по «Складу», якщо там нічого — по назві.
const PF_FABRIC_RULES = [
  [/мусл/, 'Муслін'], [/велюр|вельвет/, 'Велюр'], [/велсофт/, 'Велсофт'], [/мікрофліс/, 'Мікрофліс'],
  [/на флісі/, 'Трехнитка на флісі'], [/фліс/, 'Фліс'], [/начос/, 'Трехнитка з начосом'],
  [/петл/, 'Трехнитка (петля)'], [/двонит/, 'Двонитка'], [/інтерло/, 'Інтерлок'], [/кулір/, 'Кулір'],
  [/рубчик|кашкорсе/, 'Рубчик'], [/махр/, 'Махра'], [/фланел/, 'Фланель'], [/капітон/, 'Капітон'],
  [/в.?язан/, "В'язання"], [/(^|[^а-яіїєґ])вовн|мерино/, 'Вовна'], [/льон/, 'Льон'], [/футер/, 'Футер (начіс)'],
  [/віскоз/, 'Віскоза'], [/трикотаж/, 'Трикотаж'], [/бавовн/, 'Бавовна']
];

function pfTag_(s, tag) {
  const m = s.match(new RegExp('<' + tag + '>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</' + tag + '>'));
  return m ? m[1] : '';
}
function pfSeason_(t) {
  if (/зим|утеплен|хутр|g-loft|синтепон|холофайбер|пуховик|термо/.test(t)) return 'Зима';
  if (/демісезон|вітровк|плащ/.test(t)) return 'Весна/Осінь';
  if (/шорт|майк|пісочник|сарафан|панам|купальн|літн|футболк|короткий рукав/.test(t)) return 'Літо';
  return 'Всесезонний';
}
function pfFabric_(t) {
  for (let i = 0; i < PF_FABRIC_RULES.length; i++) if (PF_FABRIC_RULES[i][0].test(t)) return PF_FABRIC_RULES[i][1];
  return '';
}
// [{name, raw}] усіх <param> тіла пропозиції
function pfParams_(body) {
  const out = [];
  body.replace(/<param name="([^"]+)"[^>]*>[\s\S]*?<\/param>/g, function (raw, n) { out.push({ name: n, raw: raw }); return raw; });
  return out;
}
function pfVal_(raw) {
  return raw.replace(/^<param[^>]*>|<\/param>$/g, '').replace(/<!\[CDATA\[|\]\]>/g, '').trim();
}

// ===== PROM: явна категорія маркетплейсу (<portal_category_id>) — 10.10.2026 =====
// Лише там, де автовизначення Prom помилялось. ID — з довідника категорій кабінету Prom.
const PF_PORTAL_RULES = [
  { cat: '1168', name: /пінетк/i, id: 32203 },               // Взуття → Пінетки (16.10.2026)
  { cat: '1168', name: /зимов|дутик/i, id: 3221211 },        // Взуття → Дитяче та підліткове зимове взуття
  { cat: '1168', id: 3221201 },                              // Взуття → Дитяче і підліткове демісезонне взуття
  { name: /накидка для годування/i, id: 34507 },          // Накидки для годування (було: Пляшечки…)
  { name: /сумка в пологовий/i, id: 163302 },             // Набори в пологовий будинок
  { name: /тренувальні труси/i, id: 3110801 },            // Дитячі трусики (було: Дитячі підгузки)
  { name: /хустинка сатинова/i, id: 31307 },              // Хустки, шалі, палантини (було: ритуальний текстиль / тканини)
  { name: /^снуд/i, id: 36306 },                          // Дитячі шарфи, манішки (було: Шарфи)
  { cat: '1088', id: 36302 },                             // Рукавички → Дитячі рукавички, рукавиці (було: Рукавиці)
  { cat: '1128', not: /набір|комплект/i, id: 32705 },     // Головні убори → Дитячі головні убори (було: Формені)
  { cat: '1135', not: /зимов|демісезон|напівкомбінезон|вельвет/i, id: 31006 } // Комбінезони → Комбінезони для малюків (було: Боді та пісочники)
  ,{ cat: '1128', name: /шапк|шолом|хомут|капор|панам|кепк|берет/i, id: 32705 }, // Головні убори: набори/комплекти шапок теж → Дитячі головні убори (18.10.2026)
  // ---- Фіксовані категорії Prom для кожної категорії сайту (18.10.2026), ID зняті з карток Prom ----
  { cat: '1130', id: 31014 },     // Боді та пісочники
  { cat: '1163', id: 31014 },     // Чоловічки → Боді та пісочники (так класифікує Prom)
  { cat: '1115', id: 31012 },     // Повзунки → Повзунки і штани для новонароджених
  { cat: '1127', id: 31016 },     // Комплекти → Комплекти для малюків
  { cat: '1124', id: 3111703 },   // Футболки, лонгсліви → Дитячі футболки та майки
  { cat: '1141', id: 31110 },     // Сукні та сарафани для дівчаток
  { cat: '1116', id: 30603 },     // Шорти → Дитячі шорти і бриджі
  { cat: '1148', id: 31113 },     // Піжами → Дитячі піжами
  { cat: '1091', id: 31101 },     // Верхній одяг → Дитячий верхній одяг
  { cat: '1103', id: 32203 },     // Пінетки
  { cat: '1096', id: 31015 },     // Царапки
  { cat: '1131', id: 15011308 },  // Конверти для новонароджених
  { cat: '1105', id: 15010510 },  // Пелюшки → Тканинні пелюшки
  { cat: '1108', id: 15011403 },  // Пледи → Дитячі покривала та пледи
  { cat: '1126', id: 40306 },     // Рушники → Дитячі рушники
  { cat: '1112', id: 15011401 },  // Подушки → Дитячі подушки
  { cat: '1133', id: 15010107 },  // Посуд для годування
  { cat: '1094', id: 15010501 },  // Слинявчики
  { cat: '1095', id: 34507 },     // Накидки для годування
  { cat: '1144', id: 15010105 },  // Пустушки та прорізувачі
  { cat: '1140', id: 15011309 }   // Аксесуари для колясок
];
function pfPortal_(name, cat) {
  for (let i = 0; i < PF_PORTAL_RULES.length; i++) {
    const r = PF_PORTAL_RULES[i];
    if (r.cat && r.cat !== cat) continue;
    if (r.name && !r.name.test(name)) continue;
    if (r.not && r.not.test(name)) continue;
    return r.id;
  }
  return 0;
}
// ===== /PROM: категорія маркетплейсу =====

function promFix_(xml) {
  const parent = {};
  xml.replace(/<category id="(\d+)"(?: parentId="(\d+)")?/g, function (all, id, p) { parent[id] = p || ''; return all; });
  const root = function (c) { let n = 0; while (parent[c] && n++ < 10) c = parent[c]; return c; };
  // 1) групи
  const groups = {}, groupOf = {};
  const re = /<offer\b([^>]*)>([\s\S]*?)<\/offer>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const id = (m[1].match(/\bid="([^"]+)"/) || [])[1];
    if (!id) continue;
    const g = (m[1].match(/group_id="([^"]+)"/) || [])[1] || ('solo-' + id);
    (groups[g] = groups[g] || []).push({ id: id, body: m[2] });
    groupOf[id] = g;
  }
  // 2) план: спільні характеристики групи + дублі
  const common = {}, drop = {}, shade = {};
  Object.keys(groups).forEach(function (g) {
    const items = groups[g], main = items[0].body;
    const ps = pfParams_(main).filter(function (p) { return PF_VARIANT_PARAMS.indexOf(p.name) < 0; });
    const has = function (n) { return ps.some(function (p) { return p.name === n; }); };
    const r = root((main.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1] || '');
    const name = (pfTag_(main, 'name_ua') || pfTag_(main, 'name')).toLowerCase();
    const sk = ps.filter(function (p) { return p.name === 'Склад'; });
    const sklad = sk.length ? pfVal_(sk[0].raw).toLowerCase() : '';
    if (!has('Сезон') && PF_SEASON_ROOTS.indexOf(r) >= 0) ps.push({ name: 'Сезон', raw: '<param name="Сезон">' + pfSeason_(name + ' ' + sklad) + '</param>' });
    if (!has('Тип тканини') && PF_FABRIC_ROOTS.indexOf(r) >= 0) {
      const f = pfFabric_(sklad) || pfFabric_(name);
      if (f) ps.push({ name: 'Тип тканини', raw: '<param name="Тип тканини">' + xmlEsc_(f) + '</param>' });
    }
    common[g] = ps.map(function (p) { return p.raw; }).join('\n');
    if (items.length < 2) return;
    const seen = {};
    items.forEach(function (it) {
      const vp = pfParams_(it.body);
      const sig = PF_VARIANT_PARAMS.map(function (n) { const x = vp.filter(function (p) { return p.name === n; }); return x.length ? pfVal_(x[0].raw) : ''; }).join('|');
      const nm = pfTag_(it.body, 'name_ua') || pfTag_(it.body, 'name');
      if (!seen[sig]) { seen[sig] = nm; return; }
      if (seen[sig] === nm) { drop[it.id] = true; return; } // повний дубль
      const a = seen[sig];
      let i = 0;
      while (i < a.length && i < nm.length && a[i] === nm[i]) i++;
      i = nm.lastIndexOf(' ', i) + 1;
      const old = vp.filter(function (p) { return p.name === 'Відтінок'; });
      shade[it.id] = (old.length ? pfVal_(old[0].raw) + ', ' : '') + (nm.slice(i).trim() || ('варіант ' + it.id));
    });
  });
  // 3) застосування
  const st = { offers: 0, dropped: 0, picsCut: 0, descUa: 0 };
  const out = xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>\s*/g, function (all, attrs, body) {
    const id = (attrs.match(/\bid="([^"]+)"/) || [])[1];
    if (!id || !groupOf[id]) return all;
    if (drop[id]) { st.dropped++; return ''; }
    st.offers++;
    // прибрати всі нерізновидні характеристики і поставити спільні для групи
    body = body.replace(/<param name="([^"]+)"[^>]*>[\s\S]*?<\/param>\s*/g, function (raw, n) {
      return PF_VARIANT_PARAMS.indexOf(n) >= 0 ? raw : '';
    });
    if (shade[id]) {
      body = body.replace(/<param name="Відтінок"[^>]*>[\s\S]*?<\/param>\s*/g, '');
      body += '<param name="Відтінок">' + xmlEsc_(shade[id]) + '</param>\n';
    }
    if (common[groupOf[id]]) body += common[groupOf[id]] + '\n';
    const pc = pfPortal_(pfTag_(body, 'name_ua') || pfTag_(body, 'name'), (body.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1] || '');
    if (pc && body.indexOf('<portal_category_id>') < 0) body += '<portal_category_id>' + pc + '</portal_category_id>\n';
    let pics = 0;
    body = body.replace(/<picture>[\s\S]*?<\/picture>\s*/g, function (p) { if (++pics <= PF_MAX_PICTURES) return p; st.picsCut++; return ''; });
    if (!pfTag_(body, 'description_ua').trim()) {
      const ru = pfTag_(body, 'description');
      if (ru.trim()) {
        body = body.replace(/<description_ua>[\s\S]*?<\/description_ua>\s*/, '');
        body += '<description_ua><![CDATA[' + ru + ']]></description_ua>\n';
        st.descUa++;
      }
    }
    return '<offer' + attrs + '>' + body + '</offer>\n';
  });
  Logger.log('promFix: ' + JSON.stringify(st));
  return tvBarcode_(tvKw_(out));
}
// ===== /PROM: УЗГОДЖЕННЯ РІЗНОВИДІВ =====

// Перевірка: запустіть testPromFix і подивіться журнал (усі лічильники проблем мають бути 0).
function testEpiShoes() {
  const xml = UrlFetchApp.fetch(SRC).getContentText('UTF-8');
  const o = epiShoeOffers_(xml);
  Logger.log('EPISHOES ' + o.length + '\n' + o.map(function (s) { return (s.match(/<offer id="([^"]+)"/) || [])[1] + ' | ' + (s.match(/<price>([^<]*)/) || [])[1] + ' | ' + (s.match(/<vendor[^>]*>([^<]*)/) || [])[1] + ' | ' + (s.match(/<param[^>]*paramcode="(12016|8546|2295)"[^>]*>[^<]*/g) || []).map(function (x) { return x.replace(/<param name="([^"]*)"[^>]*>/, '$1:'); }).join('; '); }).join('\n') + '\n---\n' + (o[0] || '').replace(/<description[\s\S]*?<\/description>/, '<description…>').replace(/<picture>[^<]*<\/picture>\n?/g, ''));
}

function epiBrandFind() {
  const o = [], base = '/v2/pim/attribute-sets/819/attributes/brand/options';
  ['?filter%5Bsearch%5D=Apawwa', '?search=Apawwa', '?filter%5Bvalue%5D=Apawwa', '?filter%5Btitle%5D=Apawwa'].forEach(function (q) {
    try { const r = epiGet_(base + q); o.push(q + ' -> ' + r.code + ' ' + r.body.slice(0, 300)); } catch (e) { o.push(q + ' ERR ' + e.message); }
  });
  let pages = 1, found = [];
  for (let page = 1; page <= pages && page <= 400; page++) {
    let r; try { r = epiGet_(base + '?page=' + page); } catch (e) { o.push('page ' + page + ' ERR ' + e.message); continue; }
    if (r.code !== 200) { o.push('page ' + page + ' HTTP ' + r.code); continue; }
    const j = JSON.parse(r.body); pages = j.pages || 1;
    (j.items || []).forEach(function (it) { const s = JSON.stringify(it.translations || []); if (/apawwa|clibee|american\s*club/i.test(s)) found.push(it.code + ' ' + s); });
  }
  o.push('pages ' + pages + ' found: ' + found.join(' || '));
  Logger.log('BRANDS\n' + o.join('\n'));
}

function epiShoeOpts() {
  const S = '819', o = [];
  const co = epiOptions_(S, 'country_of_origin'); o.push('country: китай=' + co['китай']);
  ['8546', '2295', '12016'].forEach(function (c) { const mp = epiOptions_(S, c); o.push(c + ': ' + Object.keys(mp).slice(0, 80).map(function (k) { return k + '=' + mp[k]; }).join(', ')); });
  o.push('attrs: ' + epiSetAttrs_(S).map(function (a) { return a.c + (a.r ? '*' : '') + ':' + a.n + '(' + a.t + ')'; }).join(', '));
  Logger.log('OPTS\n' + o.join('\n'));
}

function findShoeSets() {
  const out = [];
  for (let page = 1; page <= 120; page++) {
    const r = epiGet_('/v2/pim/attribute-sets?page=' + page);
    if (r.code !== 200) { out.push('HTTP ' + r.code + ' p' + page); break; }
    const j = JSON.parse(r.body);
    (j.items || []).forEach(function (it) {
      const ua = ((it.translations || []).filter(function (t) { return t.languageCode === 'ua'; })[0] || {}).title || '';
      if (/взутт|черевик|чобот|пінет|дутик|кросів|ботин/i.test(ua)) out.push(it.code + ' | ' + ua + ' | req: ' + it.attributes.filter(function (x) { return x.isRequired && !x.isSystem; }).map(function (x) { return x.code + ':' + (((x.translations || []).filter(function (t) { return t.languageCode === 'ua'; })[0] || {}).title || ''); }).join(', '));
    });
    if (page >= (j.pages || 1)) break;
  }
  Logger.log('SETS\n' + out.join('\n'));
}

function testShoesMp() {
  const pick = function (x, tag) {
    const out = [];
    x.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, a, b) {
      const c = (b.match(/<categoryId>(\d+)</) || [])[1];
      if (['11681', '11682', '11683'].indexOf(c) < 0) return all;
      const ps = (b.match(/<param name="[^"]*">[^<]*<\/param>/g) || []).join(' ').replace(/<\/?param( name=)?/g, '').replace(/>/g, ':');
      out.push(tag + ' | ' + (a.match(/\bid="(\d+)"/) || [])[1] + ' | cat ' + c + ' | ' + ((b.match(/<article>([^<]*)/) || [])[1] || '') + ' | ' + ((b.match(/<name_ua>(?:<!\[CDATA\[)?([^<\]]*)/) || [])[1] || '').slice(0, 70) + ' | ' + ((b.match(/<price>([^<]*)/) || [])[1]) + ' | ' + ps);
      return all;
    });
    const cats = (x.match(/<category id="1168\d"[^>]*>[^<]*/g) || []).join(' ; ');
    Logger.log(tag + ': ' + out.length + '\n' + cats + '\n' + out.filter(function (s, k) { return k % 6 === 0; }).join('\n'));
  };
  MP_PCT_ = MP_MARKUP.kasta; pick(kastaSplit_(buildKasta_()), 'KASTA');
  MP_PCT_ = MP_MARKUP.rozetka; pick(rzPics_(noLetimo_(addExtraRz_(rzEnrich_(buildRozetka_())))), 'RZ');
}

function testShoes() {
  MP_PCT_ = MP_MARKUP.prom;
  const x = promFix_(promEnrich_(buildFeed_()));
  const out = [];
  x.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, a, b) {
    if (!/<categoryId>1168</.test(b)) return all;
    const gr = (a.match(/group_id="([^"]+)"/) || [])[1];
    const ps = pfParams_(b).map(function (q) { return q.name + '=' + pfVal_(q.raw); }).join('; ');
    out.push(gr + ' | ' + (b.match(/<vendorCode>([^<]*)/) || [])[1] + ' | ' + (b.match(/<price>([^<]*)/) || [])[1] + ' | portal=' + ((b.match(/<portal_category_id>([^<]*)/) || [])[1] || '-') + ' | ' + ps);
    return all;
  });
  Logger.log('shoes: ' + out.length + '\n' + out.join('\n'));
}

function testPromFix() {
  MP_PCT_ = MP_MARKUP.prom;
  const x = promFix_(promEnrich_(buildFeed_()));
  const g = {};
  x.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, a, b) {
    const id = (a.match(/\bid="([^"]+)"/) || [])[1], gr = (a.match(/group_id="([^"]+)"/) || [])[1] || id;
    const p = {}; pfParams_(b).forEach(function (q) { p[q.name] = pfVal_(q.raw); });
    (g[gr] = g[gr] || []).push(p); return all;
  });
  let extra = 0, over3 = 0, dup = 0, n = 0, sez = 0;
  Object.keys(g).forEach(function (k) {
    const it = g[k], m = it[0]; n += it.length;
    const names = {}; it.forEach(function (p) { Object.keys(p).forEach(function (q) { names[q] = 1; }); if (p['Сезон']) sez++; });
    const vary = Object.keys(names).filter(function (q) { const s = {}; it.forEach(function (p) { s[p[q] || '∅'] = 1; }); return Object.keys(s).length > 1; });
    if (vary.length > 3) over3 += it.length;
    const sig = {}; it.forEach(function (p) { const s = vary.map(function (q) { return p[q] || '∅'; }).join('|'); if (it.length > 1 && sig[s]) dup++; sig[s] = 1; });
    it.slice(1).forEach(function (p) { if (Object.keys(p).some(function (q) { return !(q in m); })) extra++; });
  });
  Logger.log('Товарів: ' + n + ', із Сезоном: ' + sez + ' | зайві характеристики: ' + extra + ', >3 відмінностей: ' + over3 + ', дублі: ' + dup);
}
function doGet(e) {
  if (e && e.parameter && e.parameter.f === 'epitest') { return ContentService.createTextOutput(epiTestText_()); }
  if (e && e.parameter && e.parameter.f === 'epi') { return ContentService.createTextOutput(epiProxy_(e.parameter.p || '')).setMimeType(ContentService.MimeType.JSON); }
  if (e && e.parameter && e.parameter.f === 'epicentr') { return ContentService.createTextOutput(buildEpicentr_('xml')).setMimeType(ContentService.MimeType.XML); }
  if (e && e.parameter && e.parameter.f === 'epireport') { return ContentService.createTextOutput(buildEpicentr_('report')).setMimeType(ContentService.MimeType.JSON); }
  if (e && e.parameter && e.parameter.f === 'epiwarm') { return ContentService.createTextOutput(buildEpicentr_('warm', e.parameter.from)).setMimeType(ContentService.MimeType.JSON); }
  if (e && e.parameter && e.parameter.f === 'epipublish') { return ContentService.createTextOutput(publishEpicentr()); }
  if (e && e.parameter && e.parameter.f === 'pubfeeds') { return ContentService.createTextOutput('OK ' + publishFeeds()); }
  if (e && e.parameter && e.parameter.f === 'kastaguard') { MP_PCT_ = MP_MARKUP.kasta; return ContentService.createTextOutput(JSON.stringify(kastaPriceGuard_(kastaSplit_(buildKasta_())))); }
  if (e && e.parameter && e.parameter.f === 'mpreport') { return ContentService.createTextOutput(mpReport_()).setMimeType(ContentService.MimeType.JSON); }
  if (e && e.parameter && e.parameter.f === 'dorechireport') { return ContentService.createTextOutput(drReport_()).setMimeType(ContentService.MimeType.JSON); }
  if (e && e.parameter && e.parameter.f === 'pubdorechi') { return ContentService.createTextOutput(publishJob_('dorechi')); }
  if (e && e.parameter && e.parameter.f === 'dorechicsv') { return ContentService.createTextOutput(buildDorechiCsv_(e.parameter.n)).setMimeType(ContentService.MimeType.CSV); }
  const f = e && e.parameter && e.parameter.f;
  MP_PCT_ = f === 'rozetka' ? MP_MARKUP.rozetka : f === 'kasta' ? MP_MARKUP.kasta : MP_MARKUP.prom;
  const out = f === 'kasta' ? kastaSplit_(buildKasta_()) : f === 'rozetka' ? rzPics_(noLetimo_(addExtraRz_(rzEnrich_(buildRozetka_())))) : promFix_(promEnrich_(buildFeed_()));
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.XML);
}


// ================== ROZETKA ==================
// Той самий фід, що для Kasta, але з унікальною назвою: модель + бренд + колір + розмір + (код)
function buildRozetka_() {
  return buildKasta_().replace(/<offer id="(\d+)"[\s\S]*?<\/offer>/g, function (o, id) {
    const name = (o.match(/<name_ua><!\[CDATA\[([\s\S]*?)\]\]><\/name_ua>/) || [])[1] || '';
    const vendor = (o.match(/<vendor>([^<]*)<\/vendor>/) || [])[1] || '';
    const col = (o.match(/<param name="Колір">([^<]*)<\/param>/) || [])[1] || '';
    let sz = (o.match(/<param name="Розмір">([^<]*)<\/param>/) || [])[1] || '';
    if (sz === '-') sz = ''; // товар без розміру — без «-» у назві (09.10.2026)
    sz = sz.replace(/^(\d+)см$/, '$1 см');
    const full = [name, vendor, col, sz].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim() + ' (' + id + ')';
    return o.replace(/<name_ua>[\s\S]*?<\/name_ua>/, '<name><![CDATA[' + full + ']]></name>\n<name_ua><![CDATA[' + full + ']]></name_ua>');
  });
}

function testFeed() {
  const out = buildFeed_();
  const offers = (out.match(/<offer\b/g) || []).length;
  const groups = {};
  (out.match(/group_id="(\d+)"/g) || []).forEach(function (g) { groups[g] = 1; });
  const ready = (out.match(/in_stock="true"/g) || []).length;
  const sized = (out.match(new RegExp('<param name="' + SIZE_CHAR + '"', 'g')) || []).length;
  Logger.log('Позицій: ' + offers + ', моделей: ' + Object.keys(groups).length +
    ', готово до відправки: ' + ready + ', з розміром «за зростом»: ' + sized + ', розмір файлу: ' + out.length);
}


// ================== KASTA ==================
// Фід для Kasta (hub.kasta.ua → Товари → Імпорт новинок → XML): той самий URL веб-застосунку з ?f=kasta
// Kasta об'єднує розміри/кольори в одну картку за однаковими article + vendor.
const KASTA_COLORS = "айворі|бежевий|безбарвний|білий|білосніжний|бірюзовий|блакитний|блідо-рожевий|бордовий|бронзовий|бузковий|бурштиновий|вишневий|волошковий|гірчичний|графітовий|жовтий|зелений|золотий|золотистий|індиго|кавовий|кислотно-жовтий|кислотно-зелений|кислотно-оранжевий|кислотно-рожевий|койот|комбінований|кораловий|коричневий|кремовий|лавандовий|лайм|ліловий|лососевий|малиновий|метал|мідний|молочний|морської хвилі|м'ятний|не визначено|нержавіюча сталь|оливковий|охра|перловий|персиковий|пісочний|пляшковий зелений|помаранчевий|помаранчево-червоний|прозорий|пудровий|пурпурний|рожевий|рожево-коричневий|рожево-ліловий|рудий|салатовий|світлий|світло-бежевий|світло-бірюзовий|світло-блакитний|світло-бордовий|світло-вишневий|світло-жовтий|світло-зелений|світло-коричневий|світло-ліловий|світло-оранжевий|світло-пурпурний|світло-рожевий|світло-синій|світло-сірий|світло-фіолетовий|світло-червоний|синій|синьо-жовтий|сірий|сіро-бежевий|сіро-голубий|сіро-зелений|сіро-коричневий|сіро-синій|сіро-червоний|сливовий|смарагдовий|сріблястий|срібний|темний|темно-бежевий|темно-бірюзовий|темно-блакитний|темно-бордовий|темно-вишневий|темно-зелений|темно-золотистий|темно-коричневий|темно-ліловий|темно-пурпурний|темно-рожевий|темно-синій|темно-сірий|темно-фіолетовий|темно-червоний|теракотовий|фіолетовий|фісташковий|фуксія|хакі|цегляний|червоний|чорний|чорно-білий|яскраво-червоний".split('|');
const KASTA_COLOR_MAP = {"слонова кістка":"айворі","темний таш":"темно-бежевий","таш":"бежевий","сизий":"сіро-голубий","морський":"морської хвилі","мокко":"кавовий","рожева глазур":"світло-рожевий","капучино":"кавовий","вершковий":"кремовий","сірий меланж":"сірий","сапфіровий":"синій","умбра":"коричневий","лавровий":"оливковий","світло-графітовий":"сірий","пильна троянда":"пудровий","світло-молочний":"молочний","світло-ментоловий":"м'ятний","ніжно-рожевий":"світло-рожевий","лимонний":"світло-жовтий","карамельний":"світло-коричневий","ванільний":"кремовий","аметистовий":"ліловий","шоколадний":"темно-коричневий","графітовий меланж":"графітовий","джинс":"синій","банановий":"світло-жовтий","бежевий меланж":"бежевий","грі":"сірий","індіго":"індиго","чайна троянда":"світло-рожевий","марсал":"бордовий","світло-лимонний":"світло-жовтий","ірис":"бузковий","какао":"коричневий","пастельно-зелений":"світло-зелений","сіро-лавандовий":"лавандовий","рожевий неон":"кислотно-рожевий"};
// Відтінок сайту → колір з довідника Kasta
function kastaColor_(c) {
  const s = String(c || '').trim().toLowerCase();
  if (!s) return '';
  if (KASTA_COLORS.indexOf(s) >= 0) return s;
  if (KASTA_COLOR_MAP[s]) return KASTA_COLOR_MAP[s];
  if (COLOR_RULES[0][0].test(s)) return 'комбінований';
  const w = s.split(/\s+/)[0];
  if (KASTA_COLORS.indexOf(w) >= 0) return w;
  const b = baseColor_(s).toLowerCase();
  if (b === 'різні кольори') return 'комбінований';
  return KASTA_COLORS.indexOf(b) >= 0 ? b : 'не визначено';
}
// Якщо відтінок не точний колір Kasta — окремий артикул, щоб різні відтінки не злились в один колір
function kastaArtSuffix_(c) {
  const s = String(c || '').trim().toLowerCase();
  if (!s || KASTA_COLORS.indexOf(s) >= 0) return '';
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return '-' + h.toString(36).slice(0, 5);
}
function kastaName_(n) {
  return String(n).split(',')[0].replace(/\s+\d{1,3}([-\/]\d{1,3})?\s*(\(|міс|рок|см)[\s\S]*$/, '').trim();
}
function kastaOffer_(attrs, body, nameMap) {
  const cat = (body.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
  const group = (attrs.match(/group_id="(\d+)"/) || [])[1];
  const id = (attrs.match(/\bid="(\d+)"/) || [])[1];
  const avail = /available="true"/.test(attrs);
  const col = (body.match(/<param name="Цвет">([^<]*)<\/param>/) || [])[1];
  const sz = (body.match(/<param name="Розмір">([^<]*)<\/param>/) || [])[1];
  const nameUa = (body.match(/<name_ua>([\s\S]*?)<\/name_ua>/) || body.match(/<name>([\s\S]*?)<\/name>/) || [])[1] || '';
  const desc = (body.match(/<description_ua>([\s\S]*?)<\/description_ua>/) || body.match(/<description>([\s\S]*?)<\/description>/) || [])[1] || '';
  const price = (body.match(/<price>([\d.]+)<\/price>/) || [])[1];
  const old = (body.match(/<oldprice>([\d.]+)<\/oldprice>/) || [])[1];
  let vendor = (body.match(/<vendor>([^<]*)<\/vendor>/) || [])[1] || '';
  if (!vendor) vendor = 'MagBaby';
  const pics = body.match(/<picture>[^<]*<\/picture>/g) || [];
  const params = (body.match(/<param name="[^"]*">[^<]*<\/param>/g) || [])
    .filter(function (p) { return !/name="(Цвет|Розмір|Колір)"/.test(p); });
  const cleanName = nameUa.replace(/^<!\[CDATA\[|\]\]>$/g, '');
  let o = '<offer id="' + id + '" available="' + (avail ? 'true' : 'false') + '">\n';
  o += '<currencyId>UAH</currencyId>\n<categoryId>' + cat + '</categoryId>\n';
  o += '<vendor>' + xmlEsc_(vendor) + '</vendor>\n<article>LT' + (group || id) + kastaArtSuffix_(col) + '</article>\n';
  o += '<name_ua><![CDATA[' + ((nameMap && nameMap[group]) || kastaName_(cleanName)) + ']]></name_ua>\n';
  o += '<description_ua>' + (desc.indexOf('<![CDATA[') === 0 ? desc : '<![CDATA[' + desc + ']]>') + '</description_ua>\n';
  o += '<price>' + price + '</price>\n';
  o += '<price_old>' + (old && parseFloat(old) > parseFloat(price) ? old : price) + '</price_old>\n';
  o += '<stock_quantity>' + (avail ? STOCK_QTY : 0) + '</stock_quantity>\n';
  o += pics.slice(0, 20).join('\n') + '\n';
  if (col) o += '<param name="Колір">' + xmlEsc_(kastaColor_(col)) + '</param>\n';
  if (sz) {
    const m = sz.match(/^(\d{2,3})(\s*\(|$)/);
    o += '<param name="Розмір">' + xmlEsc_(cat && CLOTHING.indexOf(cat) >= 0 && m ? m[1] + 'см' : sz) + '</param>\n';
  } else {
    o += '<param name="Розмір">-</param>\n';
  }
  o += params.join('\n') + '\n</offer>';
  return o;
}
// Категорії сайту → id категорій Rozetka (rz_id) для автомапінгу Kasta
const KASTA_RZ = {"1088":4669801,"1092":4669777,"1094":2095652,"1095":4653696,"1096":4668175,"1103":4634041,"1105":2354842,"1108":4674510,"1109":4635767,"1110":4630468,"1112":169826,"1115":4635895,"1122":4669783,"1124":4635911,"1126":103310,"1127":4635767,"1128":4669759,"1130":4635623,"1131":195407,"1133":267134,"1134":197325,"1135":4646072,"1136":4669777,"1140":101746,"1141":4636879,"1144":266303,"1145":4636087,"1147":4635895,"1150":4635911,"1155":4637415,"1163":4646072};

// Kasta: змішані категорії сайту ділимо на підкатегорії за назвою товару (ТІЛЬКИ у файлі Kasta).
// Нові ID мапляться в аркуші «Категорія+» мапінг-файлу Kasta. Rozetka й сайт не змінюються.
const KASTA_SPLIT = {
  '1100': [[/колготк/, '11003', 'Колготки'], [/шкарпет/, '11002', 'Шкарпетки'], [/^майк/, '11004', 'Майки'], [/трус|блумер|сет/, '11001', 'Трусики']],
  '1147': [[/лосин|легінс/, '11473', 'Лосини'], [/джинс/, '11472', 'Джинси'], [/штан|брюк|джогер/, '11471', 'Штани']],
  '1155': [[/халат/, '11551', 'Халати'], [/сумк/, '11552', 'Сумки в пологовий']],
  '1092': [[/хустин|хустк/, '10921', 'Хустинки'], [/сумк|органайзер/, '10922', 'Сумки-органайзери']]
};
// Категорії, яких немає в довіднику Kasta — у фід Kasta не передаємо (рішення 06.10.2026: «Накидки для годування»).
const KASTA_EXCLUDE = ['1095'];
// Rozetka: «+» у шляху фото деякі системи читають як пробіл -> 404. Кодуємо «+» як %2B (06.10.2026).
// Rozetka блокує фото з водяним знаком magbaby.com.ua («згадка стороннього ресурсу»). Для цих товарів лишаємо тільки 1-е (чисте) фото (18.10.2026).
const RZ_FIRST_PIC_ONLY = ['519','520','521','522','523','524','559','560'];
function rzPics_(xml) {
  xml = xml.replace(/<offer id="(\d+)"[\s\S]*?<\/offer>/g, function (o, id) {
    if (RZ_FIRST_PIC_ONLY.indexOf(id) < 0) return o;
    let n = 0;
    return o.replace(/\s*<picture>[^<]*<\/picture>/g, function (p) { n++; return n === 1 ? p : ''; });
  });
  return xml.replace(/<picture>([^<]*)<\/picture>/g, function (all, u) { return '<picture>' + u.replace(/\+/g, '%2B') + '</picture>'; });
}

function kastaSplit_(xml) {
  xml = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>\s*/g, function (all) {
    const c = (all.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
    return KASTA_EXCLUDE.indexOf(c) > -1 ? '' : all;
  });
  const used = {};
  xml = xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const cat = (body.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
    const rules = KASTA_SPLIT[cat]; if (!rules) return all;
    const nm = ((body.match(/<name_ua>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name_ua>/) || body.match(/<name>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name>/) || [])[1] || '').toLowerCase();
    const r = rules.filter(function (x) { return x[0].test(nm); })[0]; if (!r) return all;
    used[r[1]] = [cat, r[2]];
    return all.replace('<categoryId>' + cat + '</categoryId>', '<categoryId>' + r[1] + '</categoryId>');
  });
  const add = Object.keys(used).map(function (id) { return '<category id="' + id + '" parentId="' + used[id][0] + '">' + used[id][1] + '</category>'; }).join('\n');
  xml = add ? xml.replace('</categories>', add + '\n</categories>') : xml;
  // Kasta (07.10.2026): країна виробництва MagBaby — Україна (Каскад: «страна-производитель» → Країна походження);
  // «+» у шляхах фото кодуємо як %2B (як для Rozetka), щоб фото гарантовано завантажувались.
  xml = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>/g, function (o) {
    o = o.replace(/<picture>([^<]*)<\/picture>/g, function (a, u) { return '<picture>' + u.replace(/\+/g, '%2B') + '</picture>'; });
    return /страна-производитель/.test(o) ? o : o.replace('</offer>', '<param name="страна-производитель">Україна</param>\n</offer>');
  });
  // Kasta (07.10.2026): розміри під розмірні сітки Kasta (лише значення, які Kasta відхилила у звіті імпорту).
  // Шапки — обхват голови; рукавички, трусики, колготки, конверти, царапки, набори — дитяча сітка «за зростом»; шкарпетки — сітка взуття/шкарпеток.
  const SZ = {
    '1128': {'68 (3-6 міс.)': '42см', '74 (6-9 міс)': '46см', '74 (6-9 міс.)': '46см', '80 (9-12 міс.)': '46см', '0-3 міс': '38см', '3-6 міс': '42см', '6-12 міс': '46см', /* Talvi 18.10.2026: діапазони → сітка Kasta (нижня межа обхвату) */ '38-40см': '38см', '44-46см': '44см', '46-48см': '46см', '48-50см': '48см', '48-52см': '48см', '50-52см': '50-54'},
    '1088': {'1': '68см', '2': '86см', '3': '104см', '4': '110см', '1-2 роки': '86см', '3-4 роки': '104см', '5-6 роки': '116см'},
    '11001': {'62/68': '62см', '74/80': '74см', '86/92': '86см', '1 (6-11 кг.)': '68см', '2 (9-15 кг.)': '80см', '3 (12-17 кг.)': '92см', '92 (18-24 міс.)': '92см', '98 (2-3 роки)': '98см', '104 (3-4 роки)': '104см', '110 (4-5 роки)': '110см', '116 (5-6 роки)': '116см'},
    '11002': {'0-6 міс': '16', '6-12 міс': '19', '1-3 роки': '22', '3-5 роки': '26'},
    '11003': {'12-18 міс': '86см', '1-2 роки': '86см', '3-4 роки': '104см', '5-6 роки': '116см'},
    '1131': {'-': '56см'}, '1096': {'-': '56см'}, '1110': {'-': '56см'}
  };
  xml = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>/g, function (o) {
    const cat = (o.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
    const map = SZ[cat];
    if (map) o = o.replace(/<param name="Розмір">([^<]*)<\/param>/, function (a, s) { const t = map[s.trim()]; return t ? '<param name="Розмір">' + t + '</param>' : a; });
    if (/<param name="Колір">світлий<\/param>/.test(o)) {
      const c = /Verner/i.test(o) ? 'коричневий' : /Iro/.test(o) ? 'оливковий' : '';
      if (c) o = o.replace('<param name="Колір">світлий</param>', '<param name="Колір">' + c + '</param>');
    }
    return o;
  });
  return xml;
}

// ===== 16.10.2026: ВЗУТТЯ (розділ 1168) для Kasta/Rozetka =====
// Rozetka ділить дитяче взуття за статтю. Дівчаткам: рожеві/фуксія; хлопчикам: решта;
// бежеві дутики ABD0166R Beige — в обидві категорії (дубль з id «9…»); пінетки — окрема категорія.
// Розмір і колір беремо з назви, бо експорт Horoshop не віддає param «Розмір» для взуття.
Object.assign(KASTA_RZ, { '11681': 4634201, '11682': 4633689, '11683': 4634041 }); // Черевики для дівчаток / для хлопчиків / Пінетки
function shoesPrep_(xml) {
  if (xml.indexOf('<categoryId>1168</categoryId>') < 0) return xml;
  xml = xml.replace('</categories>', '<category id="11681" parentId="1168">Взуття для дівчаток</category>\n<category id="11682" parentId="1168">Взуття для хлопчиків</category>\n<category id="11683" parentId="1168">Пінетки</category>\n</categories>');
  const COL = [[/black/i, 'чорний'], [/beige/i, 'бежевий'], [/fuchsia|pink/i, 'рожевий'], [/camel|коричнев/i, 'коричневий'], [/white|біл/i, 'білий'], [/темно-син|navy/i, 'синій']];
  return xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    if (body.indexOf('<categoryId>1168</categoryId>') < 0) return all;
    const nm = (body.match(/<name_ua>(?:<!\[CDATA\[)?([^<\]]*)/) || body.match(/<name>(?:<!\[CDATA\[)?([^<\]]*)/) || [])[1] || '';
    const sz = (nm.match(/розмір\s*(\d{2})/i) || [])[1];
    let col = ''; for (let i = 0; i < COL.length; i++) { if (COL[i][0].test(nm)) { col = COL[i][1]; break; } }
    let add = '';
    if (col && body.indexOf('<param name="Цвет">') < 0) add += '<param name="Цвет">' + col + '</param>\n';
    if (sz && body.indexOf('<param name="Розмір">') < 0) add += '<param name="Розмір">' + sz + '</param>\n';
    if (body.indexOf('страна-производитель') < 0) add += '<param name="страна-производитель">' + (/American\s*Club/i.test((body.match(/<vendor>([\s\S]*?)<\/vendor>/) || ['', ''])[1]) ? 'Польща' : 'Китай') + '</param>\n'; // 24.10: American Club — Польща // взуття — Китай, не Україна
    const mk = function (cat, a) { return '<offer' + a + '>' + body.replace('<categoryId>1168</categoryId>', '<categoryId>' + cat + '</categoryId>') + add + '</offer>'; };
    if (/пінетк/i.test(nm)) return mk('11683', attrs);
    if (/pink|fuchsia/i.test(nm)) return mk('11681', attrs);
    if (/beige/i.test(nm)) return mk('11681', attrs) + '\n' + mk('11682', attrs.replace(/\bid="(\d+)"/, 'id="9$1"').replace(/group_id="(\d+)"/, 'group_id="9$1"'));
    return mk('11682', attrs);
  });
}

// ===== 19.10.2026: ІГРАШКИ KIDDISVIT (розділ сайту «Іграшки» 1170–1181) — рішення Дмитра =====
// Rozetka/Kasta: ціна = РРЦ (ціна сайту) +20% (ринок на Rozetka ≈ РРЦ +20–25%, перевірено 32 позиції).
// Prom: РРЦ (+TOY_PROM_PCT, зараз 0%) (toysPromPrice_ у buildFeed_). Google/Facebook — РРЦ (фіди Horoshop). buildRozetka_ іде через buildKasta_.
const TOY_CATS = ['1170','1171','1172','1173','1174','1175','1176','1177','1178','1179','1180','1181'];
const TOY_RZ_KASTA_PCT = 20;
// Категорії Rozetka (api-seller market-categories); 1180/1181 без точного відповідника — не мапимо.
Object.assign(KASTA_RZ, { '1171': 100193, '1172': 99392, '1173': 99674, '1174': 102003, '1175': 99051, '1176': 98159, '1177': 97420, '1178': 102912, '1179': 98280 });
// Prom (buildFeed_): іграшки = РРЦ +TOY_PROM_PCT%. 19.10.2026: Prom «Економ» (комісія на іграшки 5–12,5%) → ставимо РРЦ (0%), у плюсі на всіх брендах.
const TOY_PROM_PCT = 0;
// 31.10.2026 (рішення Дмитра): дропшип із закупкою < 400 грн (визначаємо за РРЦ) — у ціні повна комісія майданчика: Prom 18, Rozetka 24,5, Kasta 22, Епіцентр 15 (MP_MARKUP). Власний склад — без комісії.
const TOY_CHEAP_LT = 500; // 31.10.2026 18:38: поріг дешевого дропшипу 500 грн (було 400) — іграшки й ДоРечі (дропшип)
const DR_OWN_ = ['DR-1842-F','DR-1818-F','DR-1891-80','DR-1891-86','DR-1891-92','DR-2076-74','DR-2076-80','DR-2076-86','DR-2076-92','DR-1908-15','DR-2030','DR-2009-38','DR-2009-40','DR-2009-42','DR-2066-38','DR-2066-40','DR-2066-42','DR-2066-44']; // ДоРечі рах. №754 (таблиця «Штрихкоди»)
// 31.10.2026 (рішення Дмитра): ДоРечі з власного складу — ціна = закупка за рах. №754 × 2 (на сайті й усіх майданчиках)
const DR_OWN_PRICE_ = { 'DR-1842-F': 3400, 'DR-1818-F': 1330, 'DR-1891-80': 3060, 'DR-1891-86': 3060, 'DR-1891-92': 3060, 'DR-2076-74': 3060, 'DR-2076-80': 3060, 'DR-2076-86': 3060, 'DR-2076-92': 3060, 'DR-1908-15': 620, 'DR-2030': 440, 'DR-2009-38': 880, 'DR-2009-40': 880, 'DR-2009-42': 880, 'DR-2066-38': 880, 'DR-2066-40': 880, 'DR-2066-42': 880, 'DR-2066-44': 880 };
// 31.10.2026 (рішення Дмитра): Prom — справжня знижка 5% на власний склад до PROM_OWN_SALE_UNTIL включно (ціна −5%, oldprice = звичайна ціна).
const PROM_OWN_DISC = 5;
const PROM_OWN_SALE_UNTIL = '2026-11-30';
const PROM_OWN_BRANDS = /^(Talvi|Timi Tex|Apawwa|Clibee|American Club)$/;
function promOwnSale_(xml) {
  const today = Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd');
  if (today > PROM_OWN_SALE_UNTIL) return xml;
  let n = 0;
  xml = xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const v = ((body.match(/<vendor>(?:<!\[CDATA\[)?\s*([^<\]]+?)\s*(?:\]\]>)?<\/vendor>/) || [])[1] || '').trim();
    const art = ((body.match(/<vendorCode>(?:<!\[CDATA\[)?\s*([^<\]\s]+)/) || [])[1] || '').trim();
    if (/^TALVI-/.test(art)) return all; // Talvi-дроп — не власний склад, без знижки
    if (!PROM_OWN_BRANDS.test(v) && DR_OWN_.indexOf(art) < 0) return all;
    const p = Number((body.match(/<price>([\d.]+)<\/price>/) || [])[1]);
    if (!(p > 0)) return all;
    const op = Number((body.match(/<oldprice>([\d.]+)<\/oldprice>/) || [])[1]);
    if (op > p) return all; // вже є знижка на сайті — не дублюємо
    const np = Math.round(p * (1 - PROM_OWN_DISC / 100));
    body = body.replace(/<price>[^<]*<\/price>/, '<price>' + np + '</price>');
    body = /<oldprice>/.test(body) ? body.replace(/<oldprice>[^<]*<\/oldprice>/, '<oldprice>' + p + '</oldprice>') : body.replace(/(<price>[^<]*<\/price>)/, '$1\n<oldprice>' + p + '</oldprice>');
    n++;
    return '<offer' + attrs + '>' + body + '</offer>';
  });
  Logger.log('Prom own sale: ' + n);
  return xml;
}

function toysPromPrice_(xml) {
  return xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const c = (body.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
    if (TOY_CATS.indexOf(c) < 0) return all;
    const p0 = parseFloat((body.match(/<price>([\d.]+)<\/price>/) || [])[1]);
    const k = 1 + (p0 < TOY_CHEAP_LT ? MP_MARKUP.prom : TOY_PROM_PCT) / 100; // 31.10.2026: дешевше 400 — комісія Prom
    body = body
      .replace(/<price>([\d.]+)<\/price>/, function (_, p) { return '<price>' + Math.round(parseFloat(p) * k) + '</price>'; })
      .replace(/<oldprice>([\d.]+)<\/oldprice>/, function (_, p) { return '<oldprice>' + Math.round(parseFloat(p) * k) + '</oldprice>'; });
    return '<offer' + attrs + '>' + body + '</offer>';
  });
}

function toysPrice_(xml) {
  return xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const c = (body.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1];
    if (TOY_CATS.indexOf(c) < 0) return all;
    const p0 = parseFloat((body.match(/<price>([\d.]+)<\/price>/) || [])[1]);
    const k = 1 + (p0 < TOY_CHEAP_LT ? MP_PCT_ : TOY_RZ_KASTA_PCT) / 100; // 31.10.2026: дешевше 400 — повна комісія майданчика
    body = body
      .replace(/<price>([\d.]+)<\/price>/, function (_, p) { return '<price>' + Math.round(parseFloat(p) * k) + '</price>'; })
      .replace(/<oldprice>([\d.]+)<\/oldprice>/, function (_, p) { return '<oldprice>' + Math.round(parseFloat(p) * k) + '</oldprice>'; });
    return '<offer' + attrs + '>' + body + '</offer>';
  });
}
// ===== /ІГРАШКИ =====

function buildKasta_() {
  const res = srcRes_(); // 04.11.2026: читання експорту шматками
  if (res.getResponseCode() !== 200) throw new Error('Horoshop feed HTTP ' + res.getResponseCode());
  let xml = toysPrice_(shoesPrep_(mpPrices_(drAdd_(res.getContentText('UTF-8')), MP_PCT_)));
  const d = Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm');
  xml = xml.replace(/<yml_catalog[^>]*>/, '<yml_catalog date="' + d + '">');
  xml = xml.replace(/<currencies>[\s\S]*?<\/currencies>/, '<currencies><currency id="UAH" rate="1"/></currencies>');
  const nameMap = {};
  xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const g = (attrs.match(/group_id="(\d+)"/) || [])[1];
    const n = (body.match(/<name_ua>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name_ua>/) || [])[1];
    if (g && n && !nameMap[g]) nameMap[g] = kastaName_(n);
    return all;
  });
  xml = xml.replace(/<category id="(\d+)"([^>]*)>/g, function (a, id, rest) {
    return KASTA_RZ[id] ? '<category id="' + id + '"' + rest + ' rz_id="' + KASTA_RZ[id] + '">' : a;
  });
  return xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    return kastaOffer_(attrs, body, nameMap);
  });
}

// ================= GITHUB PAGES: пряме посилання на фіди =================
const GH_BRANCH = 'main';

function gh_(method, path, body) {
  const p = PropertiesService.getScriptProperties();
  const res = UrlFetchApp.fetch('https://api.github.com/repos/' + p.getProperty('GH_REPO') + path, {
    method: method, contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + p.getProperty('GH_TOKEN'), Accept: 'application/vnd.github+json' },
    payload: body ? JSON.stringify(body) : undefined
  });
  const code = res.getResponseCode();
  if (code >= 300) throw new Error('GitHub ' + method + ' ' + path + ' → ' + code + ': ' + res.getContentText().slice(0, 300));
  return JSON.parse(res.getContentText());
}

function ghBlob_(text) {
  return gh_('post', '/git/blobs', { content: Utilities.base64Encode(Utilities.newBlob(text, 'application/xml').getBytes()), encoding: 'base64' }).sha;
}

// Публікація у GitHub: оновлює ЛИШЕ передані файли, решту в репозиторії залишає (base_tree).
function ghPublish_(files, msg) {
  // 01.11.2026: примусово «немає в наявності» для проданих розмірів, поки нічне вивантаження Хорошопу ще старе
  Object.keys(files).forEach(function (k) { if (/\.xml$/.test(k) && typeof oosPatch_ === 'function') files[k] = oosPatch_(files[k]); });
  const head = gh_('get', '/git/ref/heads/' + GH_BRANCH).object.sha;
  const baseTree = gh_('get', '/git/commits/' + head).tree.sha;
  const tree = Object.keys(files).map(function (f) { return { path: f, mode: '100644', type: 'blob', sha: ghBlob_(files[f]) }; });
  const treeSha = gh_('post', '/git/trees', { base_tree: baseTree, tree: tree }).sha;
  const commit = gh_('post', '/git/commits', { message: msg, tree: treeSha, parents: [head] }).sha;
  gh_('patch', '/git/refs/heads/' + GH_BRANCH, { sha: commit, force: true });
}

// Публікація по черзі, щоб не впертися в 6-хвилинний ліміт Google (тригер кожні 30 хв):
// Kasta -> Prom -> Епіцентр. Наступна задача стартує, лише якщо від початку запуску минуло < 100 с.
// Що не встигли — продовжить наступний запуск (вказівник PUB_NEXT у властивостях скрипту).
const PUB_JOBS = ['kasta', 'prom', 'epicentr', 'dorechi']; // dorechi.csv — файл імпорту ДоРечі для сайту (Horoshop не бере посилання script.google.com)
function publishJob_(job) {
  const stamp = Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm');
  if (job === 'kasta') { MP_PCT_ = MP_MARKUP.kasta; ghPublishLean_('kasta.xml', function () { const kx = tvCapChars_(tvDropOnlyAvail_(kastaOwnSale_(kastaSizeFix_(tvBarcode_(kastaSplit_(buildKasta_()))))), 24000000); kastaPriceGuard_(kx); return kx; }, 'kasta ' + stamp); return 'kasta OK'; }
  if (job === 'prom') { MP_PCT_ = MP_MARKUP.prom; TV_DROP_MAX_ = 2300; ghPublishBig_('prom.xml', tvCapChars_(tvPromDropFilter_(promFix_(promEnrich_(buildFeed_()))), 28000000), 'prom ' + stamp); return 'prom OK'; }
  if (job === 'epicentr') return publishEpicentr();
  if (job === 'dorechi') { ghPublish_({ 'dorechi.csv': buildDorechiCsv_(), 'dorechi-test.csv': buildDorechiCsv_(3) }, 'dorechi ' + stamp); return 'dorechi OK'; }
}
function publishFeeds() {
  const props = PropertiesService.getScriptProperties();
  let k = Number(props.getProperty('PUB_NEXT') || 0) % PUB_JOBS.length;
  const t0 = Date.now(), log = [], errors = [];
  for (let n = 0; n < PUB_JOBS.length; n++) {
    if (n > 0 && (Date.now() - t0 > 100000 || /^(prom|rozetka|kasta)$/.test(PUB_JOBS[k]))) break; // 04.11.2026: важкі фіди лише першими в запуску (пам'ять)
    const job = PUB_JOBS[k];
    try { log.push(publishJob_(job) + ' ' + Math.round((Date.now() - t0) / 1000) + 's'); }
    catch (e) { errors.push(job + ': ' + e.message); }
    k = (k + 1) % PUB_JOBS.length; props.setProperty('PUB_NEXT', String(k));
  }
  Logger.log(log.join(' | ') + (errors.length ? ' | ERR ' + errors.join('; ') : ''));
  if (errors.length) throw new Error('Публікація: ' + errors.join('; '));
  return log.join(' | ');
}

// Епіцентр: окремий файл epicentr.xml (Епіцентр приймає лише пряме посилання на .xml, без переадресацій)
function publishEpicentr() {
  const xml = buildEpicentr_('xml');
  const n = (xml.match(/<offer /g) || []).length;
  if (n < 100) throw new Error('Епіцентр: у фіді лише ' + n + ' товарів — не публікую');
  const stamp = Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm');
  ghPublish_({ 'epicentr.xml': xml }, 'epicentr ' + stamp);
  return 'OK ' + stamp + ' epicentr offers=' + n + ' bytes=' + xml.length;
}

function setupTrigger() {
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'publishFeeds').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('publishFeeds').timeBased().everyMinutes(30).create();
}

// ================== ROZETKA: без згадок магазину (вимога Rozetka, 05.10.2026) ==================
// Тільки для фіду Rozetka. Сайт і фіди Prom/Kasta не зачіпаються.
function noLetimo_(xml) {
  return xml.replace(/Порада LETIMO:/g, 'Порада:').replace(/Совет LETIMO:/g, 'Совет:');
}

function testNoLetimo() {
  const src = buildRozetka_();
  const out = noLetimo_(src);
  const left = out.replace(/https?:\/\/[^<\s]+/g, '').match(/letimo/gi) || [];
  Logger.log('До: ' + (src.match(/Порада LETIMO/g) || []).length + ', після: ' + (out.match(/Порада LETIMO/g) || []).length + ', інших згадок LETIMO (без URL): ' + left.length);
}


// ================== EPICENTR: доступ до довідників (06.10.2026) ==================
// Токен зберігається у Властивостях скрипту як EPICENTR_TOKEN. Його значення ніде не логуємо.
const EPI_API = 'https://merchant-api.epicentrm.com.ua';

let EPI_CALLS_ = 0, EPI_MS_ = 0, EPI_T0_ = Date.now(), EPI_TA_ = 0, EPI_TB_ = 0;
function epiGet_(path) {
  EPI_CALLS_++; const tq_ = Date.now();
  const token = PropertiesService.getScriptProperties().getProperty('EPICENTR_TOKEN');
  if (!token) throw new Error('Немає EPICENTR_TOKEN у властивостях скрипту');
  const res = UrlFetchApp.fetch(EPI_API + path, {
    headers: { Authorization: 'Bearer ' + token.trim(), Accept: 'application/json' },
    muteHttpExceptions: true
  });
  EPI_MS_ += Date.now() - tq_;
  return { code: res.getResponseCode(), body: res.getContentText('UTF-8') };
}

// Тест: чи відкриває токен довідники (набір «Боді дитячі», id 1777)
function testEpicentr() {
  const r = epiGet_('/v2/pim/attribute-sets?filter%5Bids%5D%5B%5D=1777');
  let info = 'HTTP ' + r.code;
  try {
    const j = JSON.parse(r.body);
    const it = (j.items || [])[0];
    if (it) info += ' | набір: ' + it.code + ' | атрибутів: ' + (it.attributes || []).length;
    else info += ' | відповідь: ' + r.body.slice(0, 200);
  } catch (e) { info += ' | ' + r.body.slice(0, 200); }
  Logger.log(info);
}


function epiTestText_() {
  const r = epiGet_('/v2/pim/attribute-sets?filter%5Bids%5D%5B%5D=1777');
  let info = 'HTTP ' + r.code;
  try { const j = JSON.parse(r.body); const it = (j.items || [])[0];
    if (it) info += ' | набір: ' + it.code + ' | атрибутів: ' + (it.attributes || []).length + ' | ключі: ' + Object.keys(it).join(',');
    else info += ' | ' + r.body.slice(0, 300);
  } catch (x) { info += ' | ' + r.body.slice(0, 300); }
  return info;
}


// Службовий перегляд довідників Епіцентру: лише GET і лише /v2/pim/ (тимчасово, на час налаштування фіду)
function epiProxy_(p) {
  if (!/^\/v2\/pim\/[\w\-\/%\[\]=&?.]*$/.test(p)) return JSON.stringify({ error: 'path not allowed' });
  const r = epiGet_(p);
  return r.body.slice(0, 50000);
}


// ================== EPICENTR: фід усього каталогу (06.10.2026) ==================
// f=epicentr -> XML для імпорту в кабінет Епіцентру; f=epireport -> звіт по наборах; f=epiwarm&from=N -> прогрів довідників.
// ID пропозиції = наш артикул постачальника (vendorCode), НЕ ID Prom. Ціна = ціна 1 MagBaby + 18% (mpPrice_).
// Обов'язкові поля кожного набору читаються з API Епіцентру. Якщо для обов'язкового поля немає достовірних
// даних у назві/описі/характеристиках — товар пропускається (нічого не вгадуємо). Без ціни 1 — теж пропуск.
const EPI_BRAND_CODE = '5ee656d74c3d4f75a9c5ab633005ae4f'; // Mag Baby
const EPI_PACK = {
  small: { height: 20, length: 120, width: 100, weight: 50 },
  light: { height: 20, length: 200, width: 150, weight: 120 },
  mid:   { height: 30, length: 250, width: 200, weight: 250 },
  outer: { height: 80, length: 350, width: 250, weight: 600 },
  textile: { height: 40, length: 300, width: 250, weight: 350 },
  big:   { height: 100, length: 400, width: 300, weight: 700 },
  hard:  { height: 60, length: 150, width: 120, weight: 120 }
};
const EPI_RULES = [
  ['1130', /^пісочник|мусліновий пісочник/, '6524', 'Пісочники дитячі', 'light'],
  ['1130', /^(боді|мусліновий боді)/, '787', 'Боді дитячі', 'light'],
  ['1127', /^набір боді/, '787', 'Боді дитячі', 'light'],
  ['1127', /набір|комплект/, '788', 'Набори для новонароджених', 'mid'],
  ['1110', /./, '788', 'Набори для новонароджених', 'mid'],
  ['1115', /./, '791', 'Повзунки для новонароджених', 'light'],
  ['1163', /./, '6871', 'Чоловічки дитячі', 'mid'],
  ['1131', /./, '795', 'Конверти для новонароджених', 'outer'],
  ['1145', /./, '793', 'Одяг для хрещення', 'mid'],
  ['1128', /кепк|бейсболк/, '6585', 'Кепки дитячі', 'small'],
  ['1128', /./, '166', 'Головні убори для новонароджених', 'small'],
  ['1135', /зимов|утеплен|стьобан|пухов|термо/, '796', 'Дитячі зимові комбінезони', 'outer'],
  ['1135', /./, '9092', 'Комбінезони дитячі', 'mid'],
  ['1091', /дощовик/, '', '', ''],
  ['1091', /комбінезон/, '796', 'Дитячі зимові комбінезони', 'outer'],
  ['1091', /вітровк/, '2430', 'Вітровки дитячі', 'outer'],
  ['1091', /жилет/, '811', 'Жилети дитячі', 'mid'],
  ['1091', /комплект/, '804', 'Дитячі зимові комплекти', 'outer'],
  ['1091', /куртк|пуфер|пуффер|грязепруф|парк/, '801', 'Куртки дитячі', 'outer'],
  ['1109', /спортивн/, '809', 'Спортивні костюми дитячі', 'mid'],
  ['1109', /./, '2427', 'Костюми дитячі', 'mid'],
  ['1124', /^майк/, '6561', 'Майки дитячі', 'light'],
  ['1124', /сорочк/, '812', 'Сорочки дитячі', 'light'],
  ['1124', /футболк|лонгслів/, '798', 'Футболки дитячі', 'light'],
['1124', /гольф|водолазк/, '805', 'Светри і кофти дитячі', 'light'], // Timi Tex гольфи 22.10.2026
  ['1150', /жилет/, '811', 'Жилети дитячі', 'mid'],
  ['1150', /./, '805', 'Светри і кофти дитячі', 'mid'],
  ['1147', /лосин/, '6511', 'Лосини дитячі', 'light'],
  ['1147', /джинс/, '799', 'Джинси дитячі', 'mid'],
  ['1147', /штан|брюк|джогер/, '2428', 'Штани дитячі', 'mid'],
  ['1116', /./, '2429', 'Шорти дитячі', 'light'],
  ['1141', /сарафан/, '6852', 'Сарафани дитячі', 'light'],
  ['1141', /./, '797', 'Плаття дитячі', 'light'],
  ['1148', /./, '6562', 'Піжами дитячі', 'mid'],
  ['1100', /колготк/, '2432', 'Колготки дитячі', 'small'],
  ['1100', /шкарпет/, '800', 'Шкарпетки дитячі', 'small'],
  ['1100', /трус|блумер/, '6587', 'Труси дитячі', 'small'],
  ['1100', /^майк/, '6561', 'Майки дитячі', 'small'],
  ['1103', /./, '794', 'Пінетки', 'small'],
  ['1096', /./, '7244', 'Дряпки', 'small'],
  ['1094', /./, '751', 'Слинявчики та нагрудники', 'small'],
  ['1088', /./, '2419', 'Дитячі рукавиці', 'small'],
  ['1122', /./, '2418', 'Шарфи і снуди дитячі', 'small'],
  ['1126', /./, '6503', 'Рушники дитячі', 'textile'],
  ['1105', /./, '760', 'Пелюшки дитячі', 'textile'],
  ['1108', /ковдр/, '6645', 'Ковдри дитячі', 'big'],
  ['1108', /./, '4112', 'Пледи і покривала дитячі', 'big'],
  ['1112', /./, '4870', 'Подушки дитячі', 'big'],
  ['1133', /./, '8986', 'Дитячий посуд для годування', 'hard'],
  ['1144', /прорізувач/, '4817', 'Прорізувачі', 'hard'],
  ['1144', /пустушк|соск/, '748', 'Пустушки', 'hard'],
  ['1134', /./, '899', 'Дитячі термометри для води', 'hard'],
  ['1140', /./, '847', 'Аксесуари для колясок та автокрісел', 'textile'],
  ['1155', /./, '1384', 'Товари для пологового будинку', 'mid']
];
const EPI_SYS = ['ratio', 'measure', 'description', '767', 'producer_code', 'barcodes', 'height', 'length', 'width', 'weight', 'brand', 'country_of_origin', '5123', '8484', '7165', '14195', '3969'];

const EPI_MEM_ = {}; // кеш у пам'яті на один запуск (щоб не читати CacheService для кожного товару)
// Кеш довідників: великі значення (>100 КБ, ліміт CacheService) зберігаються частинами по 40 000 символів (10.10.2026)
function epiCacheGet_(k) {
  if (k in EPI_MEM_) return EPI_MEM_[k];
  const cs = CacheService.getScriptCache(); let c = cs.get(k);
  if (c && c.indexOf('#parts:') === 0) {
    const n = Number(c.slice(7)), keys = []; for (let i = 0; i < n; i++) keys.push(k + '#' + i);
    const g = cs.getAll(keys); c = keys.every(function (x) { return g[x] != null; }) ? keys.map(function (x) { return g[x]; }).join('') : null;
  }
  let v = null; try { v = c ? JSON.parse(c) : null; } catch (e) { v = null; }
  if (v !== null) EPI_MEM_[k] = v; return v;
}
function epiCachePut_(k, v) {
  EPI_MEM_[k] = v;
  try {
    const cs = CacheService.getScriptCache(), s = JSON.stringify(v), L = 40000;
    if (s.length <= L) { cs.put(k, s, 21600); return; }
    const parts = {}, n = Math.ceil(s.length / L);
    for (let i = 0; i < n; i++) parts[k + '#' + i] = s.substr(i * L, L);
    cs.putAll(parts, 21600); cs.put(k, '#parts:' + n, 21600);
  } catch (e) {}
}
const EPI_RX_ = {};
function epiWordRx_(o) { if (!EPI_RX_[o]) EPI_RX_[o] = new RegExp('(^|[^а-яіїєґa-z])' + epiEsc_(o) + '([^а-яіїєґa-z]|$)'); return EPI_RX_[o]; }

function epiSetAttrs_(set) {
  const k = 'eps3_' + set; const c = epiCacheGet_(k); if (c) return c;
  const r = epiGet_('/v2/pim/attribute-sets?filter%5Bcodes%5D%5B%5D=' + set);
  if (r.code !== 200) throw new Error('Epicentr set ' + set + ' HTTP ' + r.code);
  const it = (JSON.parse(r.body).items || [])[0]; if (!it) throw new Error('Epicentr set ' + set + ' not found');
  const out = it.attributes.map(function (a) { const ua = (a.translations || []).filter(function (t) { return t.languageCode === 'ua'; })[0] || {}; return { c: a.code, t: a.type, r: !!a.isRequired, n: ua.title || a.code }; });
  epiCachePut_(k, out); return out;
}

function epiOptions_(set, attr) {
  const key = 'epo3_' + set + '_' + attr; const c = epiCacheGet_(key); if (c) return c;
  const map = {}; let page = 1, pages = 1;
  do {
    const r = epiGet_('/v2/pim/attribute-sets/' + set + '/attributes/' + encodeURIComponent(attr) + '/options?page=' + page);
    if (r.code !== 200) throw new Error('Epicentr options ' + set + '/' + attr + ' HTTP ' + r.code);
    const j = JSON.parse(r.body); pages = j.pages || 1;
    (j.items || []).forEach(function (o) {
      const ua = (o.translations || []).filter(function (t) { return t.languageCode === 'ua'; })[0];
      if (ua) map[String(ua.value).replace(/&#039;/g, "'").toLowerCase().trim()] = o.code;
    });
    page++;
  } while (page <= pages && page <= (attr === '78' ? 150 : 40)); // 04.11.2026: кольори — 101 сторінка
  epiCachePut_(key, map); return map;
}

function epiTag_(body, t) {
  const m = body.match(new RegExp('<' + t + '>([\\s\\S]*?)</' + t + '>'));
  if (!m) return { raw: '', text: '' };
  let v = m[1], esc;
  const cd = v.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  if (cd) { esc = xmlEsc_(cd[1]); v = cd[1]; } else { esc = v; v = v.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;|&apos;/g, "'").replace(/&amp;/g, '&'); }
  return { raw: esc, text: v };
}
function epiParams_(body) {
  const p = {};
  body.replace(/<param name="([^"]+)"[^>]*>([\s\S]*?)<\/param>/g, function (_, n, v) { p[n] = v.replace(/<!\[CDATA\[|\]\]>/g, '').trim(); return _; });
  return p;
}

const EPI_BASE = [
  [/різнокол|мульті|принт|малюн|смуж|клітин|горош|веселк|гілочк|квіт|зірочк|сердеч|листоч|emoji|леопард|камуфл/, 'різнокольоровий'],
  [/біл|молоч|слонов|айвор|вершк|кремов/, 'білий'],
  [/беж|пісоч|таш|капучин|карамел|кавов|латте|горіх/, 'бежевий'],
  [/корич|шоколад|мокко|какао|теракот/, 'коричневий'],
  [/сір|графіт|антрацит|димч/, 'сірий'],
  [/чорн/, 'чорний'],
  [/рожев|пудр|персик|корал|лосос|фукс|малин/, 'рожевий'],
  [/червон|бордо|вишн|винн|марсал/, 'червоний'],
  [/помаранч|оранж|мандарин|морквян|абрикос/, 'помаранчевий'],
  [/жовт|гірчич|лимон|солом|охр|медов/, 'жовтий'],
  [/зелен|лавров|олив|хакі|м'ят|ментол|шавл|фісташ|салат|смараг|бірюз/, 'зелений'],
  [/блакит|сиз|небес|голуб|лазур/, 'блакитний'],
  [/синій|синя|індиг|джинс|морськ|сапфір|navy/, 'синій'],
  [/фіолет|бузк|лілов|лаванд|аметист/, 'фіолетовий']
];
function epiBaseColor_(c) { const s = String(c || '').toLowerCase(); for (let i = 0; i < EPI_BASE.length; i++) if (EPI_BASE[i][0].test(s)) return EPI_BASE[i][1]; return ''; }

const EPI_MAT = [[/бавовн|котон/, 'бавовна'], [/інтерлок/, 'інтерлок'], [/ажурн\S* кулір/, 'ажурний кулір'], [/кулір/, 'кулір'], [/футер/, 'футер'], [/муслін/, 'муслін'], [/рібан/, 'рібана'], [/двонит|двохнит/, 'двохнитка'], [/тринит/, 'тринитка'], [/еластан|лайкр|спандекс/, 'еластан'], [/поліестер/, 'поліестер'], [/віскоз/, 'віскоза'], [/ластик/, 'ластик'], [/супрем/, 'супрем'], [/байк/, 'байка'], [/сатин/, 'сатин'], [/фліс/, 'фліс'], [/велюр/, 'велюр'], [/вельвет/, 'вельвет'], [/льон|льнян/, 'льон'], [/(?<!ба)вовн/, 'вовна'], [/акрил/, 'акрил'], [/плащов/, 'плащівка'], [/джинс|денім/, 'джинс'], [/силікон/, 'силікон'], [/бамбук/, 'бамбук'], [/махр/, 'махра'], [/трикотаж/, 'трикотаж'], [/шерп/, 'шерпа'], [/нейлон/, 'нейлон'], [/поліамід/, 'поліамід']];

function epiParam_(name, code, opts, values) {
  const codes = [], vals = [];
  values.forEach(function (v) { const k = opts[String(v).toLowerCase()]; if (k && codes.indexOf(k) < 0) { codes.push(k); vals.push(v); } });
  if (!codes.length) return null;
  return '<param name="' + xmlEsc_(name) + '" paramcode="' + code + '" valuecode="' + codes.join(',') + '">' + xmlEsc_(vals.join(',')) + '</param>';
}

function epiAge_(size) {
  const m = String(size).match(/\((\d+)(?:[,.](\d))?\s*[-–]\s*[\d,.]+\s*(міс|р)/i);
  if (!m) return [];
  const n = Number(m[1]);
  if (/міс/i.test(m[3])) return n === 0 ? ['від народження'] : n === 1 ? ['від 1 місяця'] : ['від ' + n + ' місяців'];
  if (n === 1) return m[2] ? ['від 1,5 року'] : ['від 1 року'];
  return ['від ' + n + ' років'];
}
function epiPattern_(color) {
  const s = String(color || '').toLowerCase(), out = [];
  if (/смуж|смугаст/.test(s)) out.push('смужка');
  if (/клітин|клітк/.test(s)) out.push('клітинка');
  if (/квіт|троянд|ромаш|волошк|півон|тюльпан|сакур/.test(s)) out.push('квіти');
  if (/сердеч|серця/.test(s)) out.push('сердечка');
  if (/горош|крапоч/.test(s)) out.push('горошок');
  if (/зірк|зірочк/.test(s)) out.push('зірки');
  const base = epiBaseColor_(color);
  if (!out.length && base === 'різнокольоровий') out.push('принт', 'з малюнком');
  if (!out.length && base) out.push('без візерунка (однотонний)', 'однотонний');
  return out;
}
// Значення за НАЗВОЮ поля (коди полів у різних наборах різні). opts — довідник цього поля в наборі.
function epiDerive_(a, ctx, opts) {
  const n = String(a.n).toLowerCase(), has = function (x) { return !!opts[x]; };
  if (/^стать/.test(n)) {
    if (ctx.sex === 'b') return ['для хлопчика', 'для хлопчиків'];
    if (ctx.sex === 'g') return ['для дівчинки', 'для дівчаток'];
    return has('унісекс') ? ['унісекс'] : ['для хлопчика', 'для хлопчиків', 'для дівчинки', 'для дівчаток'];
  }
  if (/^сезон/.test(n)) return ctx.season;
  if (/^базовий колір/.test(n)) return ctx.base ? [ctx.base] : [];
  if (/^колір/.test(n)) return ctx.color ? [ctx.color.toLowerCase(), ctx.base] : [];
  if (/^матеріал$/.test(n)) return ctx.mats;
  if (/^зріст/.test(n)) return ctx.heights;
  if (/довжина рукава/.test(n)) return ctx.sleeve ? [ctx.sleeve] : [];
  if (/тип застібки/.test(n)) return ctx.fast ? [ctx.fast] : [];
  if (/^вік дитини/.test(n)) return epiAge_(ctx.size);
  if (/^візерунок/.test(n)) return epiPattern_(ctx.color);
  if (/^стиль/.test(n)) return /спортивн/.test(ctx.nl) ? ['спортивний'] : /джинс|денім/.test(ctx.nl) ? ['denim'] : ['повсякденний'];
  if (/склад комплекту/.test(n)) {
    const stem = function (w) { return w.slice(0, Math.max(4, Math.min(5, w.length))); };
    const ok = Object.keys(opts).filter(function (o) { const parts = o.split(/\s*(?:,| і | та | и )\s*/).filter(Boolean); return parts.length > 1 && parts.every(function (p) { return ctx.t.indexOf(stem(p.trim())) > -1; }); });
    const maxP = Math.max.apply(null, ok.map(function (o) { return o.split(/,| і | та /).length; }).concat([0]));
    return ok.filter(function (o) { return o.split(/,| і | та /).length === maxP; }).slice(0, 1);
  }
  if (a.c === '10899' || /^особлив/.test(n)) {
    return Object.keys(opts).filter(function (o) {
      if (/рукав/.test(o)) return !!ctx.sleeve && ((/без рукав/.test(o) && ctx.sleeve === 'без рукавів') || (/коротк/.test(o) && ctx.sleeve === 'короткі') || (/довг/.test(o) && ctx.sleeve === 'довгі'));
      const core = o.replace(/^(з|із|на|без)\s+/, ''); return core.length >= 5 && ctx.t.indexOf(core) > -1;
    });
  }
  if (/^розмір|обхват/.test(n)) {
    // Лише точний збіг з довідником. Беремо розмір ДО дужок ("38-42 (3-6 міс.)" -> "38-42"; "68 (3-6 міс.)" -> "68").
    // Числа з дужок (місяці/роки) НЕ використовуємо. Немає точного збігу -> поле не заповнюємо.
    const raw = String(ctx.size || '').replace(/\(.*$/, '').replace(/см/gi, '').replace(/\s+/g, '').replace(/[–—]/g, '-').toLowerCase();
    if (raw && opts[raw]) return [raw];
    const rawM = raw.replace(/міс\.?$/, ''); // "0-6 міс" -> "0-6" (лише місяці; роки не чіпаємо)
    if (rawM !== raw && opts[rawM]) return [rawM];
    if ((raw === '' || raw === '-') && opts['one size']) return ['one size']; // товар без розміру

    const first = (raw.match(/^\d+/) || [])[0];
    if (first && !/-/.test(raw) && opts[first]) return [first];
    return [];
  }
  if (/^вид/.test(n)) {
    return Object.keys(opts).filter(function (o) {
      if (/рукав/.test(o)) return !!ctx.sleeve && ((/коротк/.test(o) && ctx.sleeve === 'короткі') || (/довг/.test(o) && ctx.sleeve === 'довгі') || (/без рукав/.test(o) && ctx.sleeve === 'без рукавів'));
      return o.length >= 4 && ctx.nl.indexOf(o) > -1 && epiWordRx_(o).test(ctx.nl);
    });
  }
  // інше: значення, яке дослівно є в назві товару
  return Object.keys(opts).filter(function (o) { return o.length >= 4 && ctx.nl.indexOf(o) > -1 && epiWordRx_(o).test(ctx.nl); });
}
// Значення поля Епіцентру з однойменної характеристики MagBaby — лише точний збіг з довідником
function epiMbVals_(a, mbP, opts) {
  const n = String(a.n).toLowerCase().trim();
  const k = Object.keys(mbP || {}).filter(function (x) { return x.toLowerCase() === n; })[0];
  if (!k) return [];
  return String(mbP[k]).split(/\s*[|,;]\s*/).map(function (v) { return v.toLowerCase().trim(); }).filter(function (v) { return v && opts[v]; });
}
function epiNum_(s) { return (String(s || '').match(/\d+/g) || []).map(Number); }
function epiEsc_(s) { return s.replace(/[.*+?^$(){}|[\]\\]/g, '\\$&'); }

// Російські назви й описи — з фіду MagBaby російською (той самий MB_FEED_URL, але export_lang=ru), ключ = артикул.
// Необов'язкові поля: якщо фід недоступний — просто без RU, фід Епіцентру все одно формується.
function epiRu_() {
  const map = {};
  try {
    const url = String(PropertiesService.getScriptProperties().getProperty('MB_FEED_URL') || '').replace(/export_lang=uk$/, 'export_lang=ru');
    if (!/export_lang=ru$/.test(url)) return map;
    const r = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
    if (r.getResponseCode() !== 200) return map;
    const un = function (s) { return String(s || '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&amp;/g, '&').trim(); };
    r.getContentText('UTF-8').split('<item>').slice(1).forEach(function (s) {
      const id = un((s.match(/<g:id>([\s\S]*?)<\/g:id>/) || [])[1]);
      const t = un((s.match(/<g:title>([\s\S]*?)<\/g:title>/) || [])[1]);
      const d = un((s.match(/<g:description>([\s\S]*?)<\/g:description>/) || [])[1]);
      if (id && /[а-яё]/i.test(t) && !/[іїєґ]/i.test(t)) map[id] = { t: t.slice(0, 150), d: d.slice(0, 12000) };
    });
  } catch (e) {}
  return map;
}

// ===== 16.10.2026: ВЗУТТЯ (розділ сайту 1168) для Епіцентру =====
// Набір 819 «Черевики дитячі»: обов'язкові Розмір (12016), Матеріал верху (8546), Сезон (2295).
// Ціна = ціна сайту (рішення Дмитра 16.10.2026). Матеріал — лише підтверджений (Selfy / опис); моделі без даних пропускаються.
const EPI_SHOE_SET = '819', EPI_SHOE_TITLE = 'Черевики дитячі';
const EPI_SHOE_BRANDS = { 'Apawwa': '79a2acb61e804bc4a163cfd318e435ce', 'Clibee': '4f262857bc064e3d9dade59878bbe110', 'American Club': '27e7f78dda1a4ef3b688fa92f29c6812' }; // American Club додано 31.10.2026 (код з довідника Епіцентру);
// [регулярка за назвою, матеріал верху (значення довідника 8546), сезон (2295)]
const EPI_SHOE_MODELS = [
  [/ABD5521R/i, 'штучна шкіра', ['зима']],   // Selfy: екошкіра (коричневі й чорні)
  [/ABD0166R/i, 'поліестер', ['зима']],      // дутики (Beige — опис; Black — та сама модель)
  [/ABD0176R/i, 'поліестер', ['зима']],      // Selfy: поліестер
  [/ABQ0771R/i, 'штучна шкіра', ['демісезон', 'весна', 'осінь']], // опис: штучна шкіра
  [/ABD0026R/i, 'штучна шкіра', ['зима']],   // Дмитро 16.10.2026: штучна шкіра (kidzone.lv писав «rubber» — помилково)
  [/HA828-3/i, 'штучна шкіра', ['зима']],     // joy-kids.com.ua: шкірозамінник, зимове
  [/KA799-4/i, 'штучна шкіра', ['зима']],     // prom.ua: штучна шкіра, зима
  [/XD\s*198/i, 'штучна шкіра', ['демісезон', 'весна', 'осінь']] // 24.10.2026 American Club XD 198: Selfy — екошкіра, фліс, весна-осінь
];
function epiShoeOffers_(xml) {
  const out = [];
  if (xml.indexOf('<categoryId>1168</categoryId>') < 0) return out;
  const S = EPI_SHOE_SET, pk = EPI_PACK.outer || EPI_PACK.mid;
  let measure = ''; try { const mo = epiOptions_(S, 'measure'); const k = Object.keys(mo).filter(function (x) { return /^шт/.test(x); })[0]; if (k) measure = '<param name="Міра виміру" paramcode="measure" valuecode="' + mo[k] + '">' + xmlEsc_(k) + '</param>\n'; } catch (e) {}
  const oSize = epiOptions_(S, '12016'), oMat = epiOptions_(S, '8546'), oSeas = epiOptions_(S, '2295');
  xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    if (body.indexOf('<categoryId>1168</categoryId>') < 0) return all;
    const nameUa = (epiTag_(body, 'name_ua').text || epiTag_(body, 'name').text).trim();
    const mdl = EPI_SHOE_MODELS.filter(function (r) { return r[0].test(nameUa); })[0]; if (!mdl) return all;
    const vendor = epiTag_(body, 'vendor').text.trim(), bcode = EPI_SHOE_BRANDS[vendor]; if (!bcode) return all;
    const art = epiTag_(body, 'vendorCode').text.trim(); if (!art) return all;
    const size = (nameUa.match(/розмір\s*(\d{2})/i) || [])[1]; if (!size) return all;
    const price = epiTag_(body, 'price').text.trim(); if (!price) return all;
    const parts = [epiParam_('Розмір', '12016', oSize, [size]), epiParam_('Матеріал верху', '8546', oMat, [mdl[1]]), epiParam_('Сезон', '2295', oSeas, mdl[2])];
    if (parts.some(function (p) { return !p; })) return all; // немає значення в довіднику — не відправляємо
    const pics = (body.match(/<picture>[\s\S]*?<\/picture>/g) || []).slice(0, 15).join('\n');
    const desc = epiTag_(body, 'description_ua').raw || epiTag_(body, 'description').raw;
    const avail = /available="true"/.test(attrs) ? 'true' : 'false';
    out.push('<offer id="' + xmlEsc_(art) + '" available="' + avail + '">\n<price>' + price + '</price>\n' +
      '<category code="' + S + '">' + EPI_SHOE_TITLE + '</category>\n<attribute_set code="' + S + '">' + EPI_SHOE_TITLE + '</attribute_set>\n' +
      '<name lang="ua">' + xmlEsc_(nameUa) + '</name>\n' + pics + '\n<description lang="ua">' + desc + '</description>\n' +
      '<vendor code="' + bcode + '">' + xmlEsc_(vendor) + '</vendor>\n<country_of_origin code="' + (/American\s*Club/i.test(vendor) ? 'pol">Польща' : 'chn">Китай') + '</country_of_origin>\n' + measure +
      '<param name="Мінімальна кратність товару" paramcode="ratio">1</param>\n' +
      '<param name="Висота" paramcode="height">' + pk.height + '</param>\n<param name="Глибина" paramcode="length">' + pk.length + '</param>\n' +
      '<param name="Ширина" paramcode="width">' + pk.width + '</param>\n<param name="Вага" paramcode="weight">' + pk.weight + '</param>\n' +
      parts.join('\n') + '\n</offer>');
    return all;
  });
  return out;
}

function epiSetInfo() { // 31.10.2026: обов'язкові поля довідника Епіцентру (для ручних карток, напр. пінетки 794)
  const S = '794', o = [];
  epiSetAttrs_(S).forEach(function (x) { let opt = ''; if ((x.t === 'select' || x.t === 'multiselect') && x.c !== 'brand') { try { const op = epiOptions_(S, x.c); opt = Object.keys(op).slice(0, 40).map(function (k) { return k + '=' + op[k]; }).join(', '); } catch (e) { opt = 'ERR'; } } o.push((x.r ? '*' : '') + x.c + ' ' + x.t + ' ' + x.n + (opt ? ' :: ' + opt : '')); });
  Logger.log('SET ' + S + '\n' + o.join('\n'));
}
var EPI_DIAG_ = null; // regex: обмежити звіт epiDiagOwn певними товарами
function epiDiagOwn() {
  EPI_DIAG_ = /XD198|TV-02383|BEIBIK|4820000311809|FD120/;
  const rep = JSON.parse(buildEpicentr_('report'));
  Logger.log('DIAG ' + JSON.stringify({ total: rep.total, ok: rep.ok, noRule: rep.noRule, bySet: rep.bySet, samples: rep.samples }));
}
function buildEpicentr_(mode, from) {
  const res = srcRes_(); // 04.11.2026: читання експорту шматками
  if (res.getResponseCode() !== 200) throw new Error('Horoshop feed HTTP ' + res.getResponseCode());
  const xml = tvDropAvail_(drAdd_(res.getContentText('UTF-8'))); // 04.11.2026: Talvi-дроп лише в наявності (таблиця залишків)
  if (mode === 'warm') {
    const sets = []; EPI_RULES.forEach(function (r) { if (r[2] && sets.indexOf(r[2]) < 0) sets.push(r[2]); });
    const start = Number(from || 0), t0 = Date.now(), done = [];
    for (let i = start; i < sets.length && Date.now() - t0 < 240000; i++) {
      epiSetAttrs_(sets[i]).forEach(function (a) { if ((a.t === 'select' || a.t === 'multiselect') && ['brand', 'country_of_origin'].indexOf(a.c) < 0) epiOptions_(sets[i], a.c); });
      done.push(sets[i]);
    }
    return JSON.stringify({ sets: sets.length, from: start, warmed: done.length, next: start + done.length < sets.length ? start + done.length : null });
  }
  const countryUkr = (function () { const k = epiCacheGet_('epi_ukr'); if (k) return k; const mp = epiOptions_('787', 'country_of_origin'); epiCachePut_('epi_ukr', mp['україна']); return mp['україна']; })();
  const rep = { total: 0, ok: 0, bySet: {}, noRule: {}, noPrice: 0 };
  Logger.log('epi: старт ' + Math.round((Date.now() - EPI_T0_) / 1000) + 's');
  const ruMap = {}; // epiRu_() вимкнено 09.10.2026: фід MagBaby RU вантажиться до 45 с і давав лише ~350 назв; RU тепер з кешу перекладів (ru-cache.json)
  Logger.log('epi: MagBaby RU ' + Math.round((Date.now() - EPI_T0_) / 1000) + 's');
  rep.ru = Object.keys(ruMap).length;
  const ruCache = prRuLoad_(); prMbIndex_();
  Logger.log('epi: кеш RU + 15.xml ' + Math.round((Date.now() - EPI_T0_) / 1000) + 's'); // кеш перекладів uk→ru (той самий, що для Prom)
  const out = [];
  xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    rep.total++;
    if (rep.total % 1000 === 0) Logger.log('epi: ' + rep.total + ' оф., ' + Math.round((Date.now() - EPI_T0_) / 1000) + 's, API ' + EPI_CALLS_ + ' викл./' + Math.round(EPI_MS_ / 1000) + 's, MB/RU ' + Math.round(EPI_TA_ / 1000) + 's, поля ' + Math.round(EPI_TB_ / 1000) + 's');
    const cat = epiTag_(body, 'categoryId').text.trim(); if (EPI_DIAG_ && !EPI_DIAG_.test(body)) return all; // діагностика 31.10.2026
    const nameUa = (epiTag_(body, 'name_ua').text || epiTag_(body, 'name').text).trim();
    const nl = nameUa.toLowerCase();
    const tvArt_ = (epiTag_(body, 'vendorCode').text || '').trim();
    const tvR_ = /^TALVI-/.test(tvArt_) ? tvDropEpiRule_(cat, nl, (body.match(/<param name="Розмір">([^<]*)</) || [])[1] || '') : undefined; // 04.11.2026 Talvi-дроп
    if (tvR_ === false) { const kk = 'Talvi ' + cat + ' (немає відповідника в Епіцентрі)'; rep.noRule[kk] = (rep.noRule[kk] || 0) + 1; return all; }
    const rule = tvR_ || EPI_RULES.filter(function (r) { return r[0] === cat && r[1].test(nl); })[0];
    if (!rule || !rule[2]) { const k = cat + ' ' + nameUa.split(/\s+/).slice(0, 2).join(' '); rep.noRule[k] = (rep.noRule[k] || 0) + 1; return all; }
    const S = rule[2];
    const R = rep.bySet[S] = rep.bySet[S] || { title: rule[3], ok: 0, skip: {} };
    const skip = function (why) { R.skip[why] = (R.skip[why] || 0) + 1; };
    const art = epiTag_(body, 'vendorCode').text.trim();
    if (!art) { skip('немає артикула'); return all; }
    const sp = epiTag_(body, 'price').text.trim();
    const price = mpPrice_(art, nameUa, sp, MP_MARKUP.epicentr);
    if (!price) { rep.noPrice++; skip('немає ціни 1'); return all; }
    const P = epiParams_(body);
    const descText = epiTag_(body, 'description_ua').text || epiTag_(body, 'description').text;
    const t = (nameUa + ' ' + descText.replace(/<[^>]+>/g, ' ')).toLowerCase();
    const color = String(P['Цвет'] || P['Колір'] || '').trim();
    const sostav = String(P['Склад'] || '');
    const size = String(P['Розмір'] || '');
    const ctx = { color: color, base: epiBaseColor_(color), t: t, nl: nl, size: size };
    ctx.dr = drEpiCtx_(art); // ДоРечі: значення з опису постачальника
    ctx.sex = /хлопчик/.test(t) && !/дівчинк/.test(t) ? 'b' : /дівчинк/.test(t) && !/хлопчик/.test(t) ? 'g' : 'u';
    ctx.season = /зимов|утеплен|пухов|термо|флісов|стьобан|начос|в'язан/.test(nl) ? ['осінь', 'зима'] : /демісезон/.test(nl) ? ['демісезон', 'весна', 'осінь'] : /літн|льнян|муслін|панам|шорт|сарафан|пісоч|майк|велосипедк/.test(nl) ? ['літо'] : ['весна', 'літо', 'осінь', 'зима'];
    ctx.sleeve = /майк|без рукав/.test(t) ? 'без рукавів' : /коротк\S* рукав|футболк/.test(t) ? 'короткі' : /довг\S* рукав|лонгслів|гольф/.test(t) ? 'довгі' : '';
    ctx.fast = /кнопк/.test(t) ? 'кнопки' : /блискавк/.test(t) ? 'блискавка' : /[ґг]удзик/.test(t) ? 'ґудзики' : '';
    ctx.mats = []; EPI_MAT.forEach(function (r) { if (r[0].test((sostav + ' ' + t).toLowerCase()) && ctx.mats.indexOf(r[1]) < 0) ctx.mats.push(r[1]); });
    const tA_ = Date.now();
    // Характеристики з фіду MagBaby (15.xml): доповнюють те, чого не видно з назви/опису
    const mbP = prMbParams_(nameUa) || {};
    const fr_ = String(mbP['Фасон рукава'] || '').toLowerCase(), zs_ = String(mbP['Застібка'] || '').toLowerCase(), sx_ = String(mbP['Стать'] || '').toLowerCase();
    if (!ctx.sleeve) ctx.sleeve = /без рукав/.test(fr_) ? 'без рукавів' : /корот/.test(fr_) ? 'короткі' : /довг/.test(fr_) ? 'довгі' : '';
    if (!ctx.fast) ctx.fast = /кнопк/.test(zs_) ? 'кнопки' : /блискав/.test(zs_) ? 'блискавка' : /[ґг]удзик/.test(zs_) ? 'ґудзики' : '';
    if (ctx.sex === 'u') ctx.sex = /хлопч/.test(sx_) && !/дівч/.test(sx_) ? 'b' : /дівч/.test(sx_) && !/хлопч/.test(sx_) ? 'g' : 'u';
    if (mbP['Тип тканини']) EPI_MAT.forEach(function (r) { if (r[0].test(String(mbP['Тип тканини']).toLowerCase()) && ctx.mats.indexOf(r[1]) < 0) ctx.mats.push(r[1]); });
    const sp_ = prSplitName_(nameUa), ruM_ = ruCache.n[sp_[0]];
    const ruN = (ruMap[art] && ruMap[art].t) || (ruM_ ? (ruM_ + prTailRu_(sp_[1])).slice(0, 150) : '');
    const ruD = ruCache.d[prHash_(prTag_(body, 'description_ua'))] || (ruMap[art] && ruMap[art].d) || '';
    EPI_TA_ += Date.now() - tA_; const tB_ = Date.now();
    const nums = epiNum_(size);
    ctx.nums = nums;
    ctx.heights = nums.filter(function (x) { return x >= 44 && x <= 182; }).slice(0, 2).map(String);
    const parts = [], miss = [];
    let attrsList; try { attrsList = epiSetAttrs_(S); } catch (e) { skip('API: ' + e.message); return all; }
    attrsList.forEach(function (a) {
      if (EPI_SYS.indexOf(a.c) > -1) return;
      if (a.t !== 'select' && a.t !== 'multiselect') { if (a.c === '7286' && /^TALVI-/.test(art) && size) { parts.push('<param lang="ua" paramcode="7286" name="' + xmlEsc_(a.n) + '">' + xmlEsc_(/універс/i.test(size) ? 'Універсальний' : String(size).replace(/(\s*см)+$/, ' см')) + '</param>'); return; } if (a.r) miss.push(a.n); return; } // 05.11.2026: «Розмір виробника» (текст) для Talvi
      let opts; try { opts = epiOptions_(S, a.c); } catch (e) { if (a.r) miss.push(a.n + ' (API)'); return; }
      if (ctx.dr && a.c === '78') opts = Object.assign({}, opts, DR_EPI_COLOR78); // ДоРечі: базові кольори довідника
    if (/^TALVI-/.test(art)) { const dv = tvDropEpiVals_(a, S, opts, P, nameUa); if (dv && dv.length) { const tp = epiParam_(a.n, a.c, opts, dv); if (tp) { parts.push(tp); return; } } }
    if (/^TV-/.test(art)) { const tvv = tvEpiVals_(a, nameUa, opts); if (tvv) { const tp = epiParam_(a.n, a.c, opts, tvv); if (tp) { parts.push(tp); return; } } }
    let vals = (ctx.dr && drEpiVals_(a, ctx, opts)) || epiDerive_(a, ctx, opts);
      if (!vals || !vals.length) vals = epiMbVals_(a, mbP, opts);
      if (/^(TV-|TALVI-|4820000)/.test(art) && !(vals && vals.length && epiParam_(a.n, a.c, opts, vals))) { const ov = ownEpiVals_(a, ctx, opts); if (ov.length) vals = ov; } // 30.10.2026: власний склад (Talvi, Timi Tex) — заповнення пропусків
      const prm = vals && vals.length ? epiParam_(a.n, a.c, opts, vals) : null;
      if (prm) parts.push(prm); else if (a.r) miss.push(a.n);
    });
    EPI_TB_ += Date.now() - tB_;
    if (miss.length && /^TV-/.test(art)) Logger.log('TV skip ' + art + ': ' + miss.join(', '));
    if (miss.length) { skip('немає даних: ' + miss.join(', ')); rep.samples = rep.samples || {}; miss.forEach(function (f) { const k = rule[3] + ' / ' + f; rep.samples[k] = rep.samples[k] || []; if (rep.samples[k].length < 4) rep.samples[k].push(nameUa.slice(0, 60) + ' | ' + color + ' | ' + size); }); return all; }
    const pk = EPI_PACK[rule[4]] || EPI_PACK.mid;
    const pics = (body.match(/<picture>[\s\S]*?<\/picture>/g) || []).slice(0, 15).join('\n');
    const avail = /available="true"/.test(attrs) ? 'true' : 'false';
    const desc = (epiTag_(body, 'description_ua').raw || epiTag_(body, 'description').raw).replace(/Порада LETIMO:/g, 'Порада:');
    let measure = ''; try { const mo = epiOptions_(S, 'measure'); const k = Object.keys(mo).filter(function (x) { return /^шт/.test(x); })[0]; if (k) measure = '<param name="Міра виміру" paramcode="measure" valuecode="' + mo[k] + '">' + xmlEsc_(k) + '</param>\n'; } catch (e) {}
    out.push('<offer id="' + xmlEsc_(art) + '" available="' + avail + '">\n<price>' + price + '</price>\n' +
      '<category code="' + S + '">' + rule[3] + '</category>\n<attribute_set code="' + S + '">' + rule[3] + '</attribute_set>\n' +
      '<name lang="ua">' + xmlEsc_(nameUa) + '</name>\n' + (ruN ? '<name lang="ru">' + xmlEsc_(ruN) + '</name>\n' : '') + pics + '\n<description lang="ua">' + desc + '</description>\n' + (ruD ? '<description lang="ru"><![CDATA[' + ruD.replace(/\]\]>/g, '').replace(/Совет LETIMO:/g, 'Совет:') + ']]></description>\n' : '') + ((nameUa.match(/["«“„]([^"»”“]+)["»”“]/) || [])[1] ? '<param paramcode="producer_code" name="Модель виробника (референцiя)"><![CDATA[' + (nameUa.match(/["«“„]([^"»”“]+)["»”“]/) || [])[1].trim() + ']]></param>\n' : '') +
      (drIsArt_(art) ? '<vendor code="0257f14b7a0e4ae3a4056111e84198c0">ДоРечі</vendor>\n' : /^(TV|TALVI)-/.test(art) ? '<vendor code="ee151abe25104667a4651ca80c043d22">Talvi</vendor>\n' : /^4820000\d{6}$/.test(art) ? '<vendor code="uw1446137643j6c6">Тімі текс</vendor>\n' : '<vendor code="' + EPI_BRAND_CODE + '">Mag Baby</vendor>\n') + '<country_of_origin code="' + countryUkr + '">Україна</country_of_origin>\n' + measure +
      '<param name="Мінімальна кратність товару" paramcode="ratio">1</param>\n' +
      '<param name="Висота" paramcode="height">' + pk.height + '</param>\n<param name="Глибина" paramcode="length">' + pk.length + '</param>\n' +
      '<param name="Ширина" paramcode="width">' + pk.width + '</param>\n<param name="Вага" paramcode="weight">' + pk.weight + '</param>\n' +
      (sostav ? '<param lang="ua" paramcode="5123" name="Склад тканини">' + xmlEsc_(sostav) + '</param>\n' : '') +
      parts.join('\n') + '\n</offer>');
    R.ok++; rep.ok++;
    return all;
  });
  Logger.log('epi: цикл ' + Math.round((Date.now() - EPI_T0_) / 1000) + 's, API ' + EPI_CALLS_ + ' викл./' + Math.round(EPI_MS_ / 1000) + 's');
  if (mode === 'report') return JSON.stringify(rep, null, 1);
  const d = Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm');
  return '<?xml version="1.0" encoding="UTF-8"?>\n<yml_catalog date="' + d + '">\n<offers>\n' + (mode === 'xml' ? out.concat(epiShoeOffers_(xml), extraEpiOffers_()) : out).join('\n') + '\n</offers>\n</yml_catalog>';
}

// ================== ЦІНИ МАРКЕТПЛЕЙСІВ = ціна 1 MagBaby + надбавка (рішення 06.10.2026) ==================
// Prom, Kasta, Епіцентр: +18%. Rozetka: +25%. Сайт не змінюється.
// Ціна 1 = g:price з фіду MagBaby (Властивість скрипту MB_FEED_URL), ключ = артикул (vendorCode = g:id MagBaby).
// Якщо артикула немає у фіді MagBaby — запасний варіант таблиця P1; якщо й там немає — ціна лишається як на сайті.
// Націнка до ціни 1 MagBaby, % = комісія конкретного маркетплейсу (рішення Дмитра 07.10.2026, бо падає конверсія):
// Prom 18%, Rozetka 24,5% (комісія на дитячі товари), Kasta 22% (основне роялті), Епіцентр 15% (роялті на дитячий одяг).
// Попередньо було: prom 18, kasta 30, epicentr 25, rozetka 25.
const MP_MARKUP = { prom: 18, kasta: 22, epicentr: 15, rozetka: 24.5 };
let MP_PCT_ = 18;
let P1_BY_ART_ = null;

// Захист: фід MagBaby має містити щонайменше MB_MIN_ITEMS позицій. Якщо завантаження зірвалось —
// беремо останню успішну копію з кешу (до 6 год). Якщо й її немає — помилка: фід маркетплейсу НЕ віддається
// з неправильними цінами (майданчик лишається на попередній правильній версії).
const MB_MIN_ITEMS = 5000;
function p1ByArt_() {
  if (P1_BY_ART_) return P1_BY_ART_;
  const url = PropertiesService.getScriptProperties().getProperty('MB_FEED_URL');
  if (!url) throw new Error('Немає MB_FEED_URL у властивостях скрипту');
  const cache = CacheService.getScriptCache();
  for (let a = 1; a <= 3; a++) {
    try {
      const r = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
      const t = r.getContentText('UTF-8');
      if (r.getResponseCode() === 200) {
        const map = {}; let n = 0;
        t.split('<item>').slice(1).forEach(function (s) {
          const id = (s.match(/<g:id>(?:<!\[CDATA\[)?\s*([^<\]\s]+)/) || [])[1];
          const p = (s.match(/<g:price>(?:<!\[CDATA\[)?\s*([\d.,]+)/) || [])[1];
          if (id && p) { map[id] = parseFloat(p.replace(',', '.')); n++; }
        });
        if (n >= MB_MIN_ITEMS) {
          try { const keys = Object.keys(map), half = Math.ceil(keys.length / 2), c1 = {}, c2 = {};
            keys.forEach(function (k, i) { (i < half ? c1 : c2)[k] = map[k]; });
            cache.putAll({ mbp1_a: JSON.stringify(c1), mbp1_b: JSON.stringify(c2) }, 21600); } catch (e) {}
          P1_BY_ART_ = map; return map;
        }
      }
    } catch (e) {}
    Utilities.sleep(2000);
  }
  const c = cache.getAll(['mbp1_a', 'mbp1_b']);
  if (c.mbp1_a && c.mbp1_b) { P1_BY_ART_ = Object.assign({}, JSON.parse(c.mbp1_a), JSON.parse(c.mbp1_b)); return P1_BY_ART_; }
  throw new Error('Фід MagBaby недоступний або неповний — фід маркетплейсу не сформовано, щоб не віддати неправильні ціни');
}

// Сторож цін Kasta: кожен товар, для якого відома ціна 1 MagBaby, має коштувати рівно ціна 1 + MP_MARKUP.kasta %.
// Якщо хоч 1% таких товарів не збігається — фід НЕ публікується (Kasta лишається на попередній правильній версії).
function kastaPriceGuard_(xml) {
  const p1 = p1ByArt_(); let checked = 0, bad = 0; const ex = [];
  // У фіді Kasta немає артикула MagBaby — зіставляємо id пропозиції з vendorCode через фід сайту
  const idArt = {}; UrlFetchApp.fetch(SRC, { muteHttpExceptions: true }).getContentText('UTF-8').replace(/<offer\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/offer>/g, function (a, id, b) { const vc = (b.match(/<vendorCode>(?:<!\[CDATA\[)?\s*([^<\]\s]+)/) || [])[1]; if (vc) idArt[id] = vc; return a; });
  xml.replace(/<offer\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/offer>/g, function (all, oid, body) {
    const art = idArt[oid] || '';
    const pr = Number((body.match(/<price>([\d.]+)<\/price>/) || [])[1]);
    if (p1[art] > 0 && pr > 0) { checked++; const exp = mbCom_(mbPrice_(art, p1[art]), MP_MARKUP.kasta); /* 02.11.2026: MagBaby = закупка ×2 */ if (pr !== exp) { bad++; if (ex.length < 5) ex.push(art + ': ' + pr + ' замість ' + exp); } }
    return all;
  });
  if (checked < 1000 || bad > checked * 0.01) throw new Error('Kasta: ціни не відповідають правилу «MagBaby = закупка ×2» (перевірено ' + checked + ', помилок ' + bad + ': ' + ex.join('; ') + ') — фід не опубліковано');
  return { checked: checked, bad: bad };
}

// 02.11.2026 (рішення Дмитра): MagBaby на маркетплейсах = закупка з кабінету box.magbaby.ua × 2 (не нижче РРЦ). Ключ = g:id MagBaby (vendorCode), значення = ціна кабінету. Без ціни кабінету = РРЦ × 1,5 (кабінет = 75% РРЦ).
const MB_CAB_ = {"335968075":51,"613761677":51,"613764695":51,"613765288":51,"613767599":51,"731285088":296,"731285617":296,"731285618":296,"731286805":106.2,"761679201":106.2,"992750652":296,"1040832766":517,"1040909002":26.4,"1065642069":1342,"1076013176":588,"1076013177":588,"1076013178":588,"1076013179":588,"1076015105":296,"1196814203":521,"1196823610":71,"1196823611":71,"1196823612":71,"1196823613":71,"1196839551":663,"1196843707":663,"1210848654":660,"1210848655":660,"1261379877":318,"1261379878":318,"1261379879":318,"1282254272":442,"1282254273":442,"1291146820":1042,"1311322971":517,"1365176627":262.8,"1365176628":262.8,"1376924728":221,"1376924729":221,"1376924730":221,"1391958801":238.8,"1391967387":663,"1399351759":262.8,"1399351760":262.8,"1410958539":296,"1410958540":296,"1410958541":296,"1421916177":189.6,"1421916178":189.6,"1421916179":189.6,"1421916180":189.6,"1421916181":189.6,"1421917633":189.6,"1421917634":189.6,"1421917635":189.6,"1421917636":189.6,"1421917637":189.6,"1421921248":189.6,"1423445149":281,"1471698216":163.1,"1471698217":163.1,"1471698422":163.1,"1471698546":163.1,"1471698705":163.1,"1471698793":163.1,"1471698794":163.1,"1471700346":163.1,"1478337499":420,"1478337500":420,"1478337585":420,"1478337586":420,"1478338494":1005.75,"1478338495":1005.75,"1521174256":2463,"1521175220":2463,"1521175221":2463,"1521175222":2463,"1521175223":2463,"1535651556":442,"1535651557":442,"1553218307":367,"1553218311":367,"1553225013":367,"1553225017":367,"1565537562":1496,"1565537563":1496,"1565546933":1496,"1565546934":1496,"1565734691":513,"1565734692":513,"1565734693":513,"1565734694":513,"1565735801":513,"1565735802":513,"1565735803":513,"1565735804":513,"1565739184":513,"1565739185":513,"1565739186":513,"1565739187":513,"1622957279":296,"1639500721":271.2,"1688380179":25.2,"1688381318":25.2,"1688381319":25.2,"1689997781":92.4,"1700582978":221,"1700582979":221,"1721648312":1042,"1721648313":1042,"1721648314":1042,"1721648315":1042,"1721648316":1042,"1721652347":1042,"1723596591":1042,"1723596592":1042,"1723596593":1042,"1723596594":1042,"1723631782":71,"1723652245":71,"1723668045":71,"1768362389":667,"1768820737":427.8,"1793115047":502,"1797608144":502,"1797608331":585,"1799475165":817,"1799478182":817,"1799478183":817,"1799478184":817,"1801221781":79.2,"1801229468":79.2,"1801229469":79.2,"1801245177":79.2,"1801247468":79.2,"1804590069":1117,"1804590070":1117,"1804590071":1117,"1805550898":1117,"1805550899":1117,"1805550900":1117,"1805560932":91.5,"1805563148":367,"1805563150":367,"1805563627":367,"1805563628":367,"1805563630":367,"1807763827":1042,"1807763828":1042,"1807763829":1042,"1807763830":1042,"1808176221":221,"1808176222":221,"1808176223":221,"1816843210":870,"1816857003":345.75,"1818497316":221,"1818501805":221,"1818503470":221,"1818508936":221,"1818510202":221,"1819744535":1196,"1823342359":107.8,"1849982701":271.2,"1849982702":271.2,"1860686270":146.9,"1860686272":146.9,"1860691358":146.9,"1860691360":146.9,"1860691361":146.9,"1860749341":335.25,"1860749344":335.25,"1861376541":570,"1861376542":570,"1861850653":335.25,"1861850656":335.25,"1864928623":296,"1864928624":296,"1864940095":175.2,"1864947203":92.95,"1864947204":92.95,"1864947205":92.95,"1864947206":92.95,"1864947207":92.95,"1864947208":92.95,"1865431141":1117,"1865431142":1117,"1865431143":1117,"1894975900":877,"1920834515":924,"1920834516":924,"1920834517":924,"1920834518":924,"1920840323":924,"1920863056":628.5,"1943271096":521,"1943271097":521,"1943271098":521,"1943271099":521,"1979701276":296,"1981813295":513,"1981813296":513,"1981813297":513,"1981816042":513,"1981816043":513,"1981817086":521,"1981835602":2463,"1981835603":2463,"1981835604":2463,"1981835605":2463,"1981836012":2463,"1981836013":2463,"1981836014":2463,"1981836015":2463,"1981837608":2463,"1981837609":2463,"1981837610":2463,"1981837611":2463,"1997756552":468.65,"2004567184":1576.8,"2020439027":296,"2020439028":296,"2020439029":296,"2020439030":296,"2020439031":296,"2020447565":296,"2020447566":296,"2020447567":296,"2020447568":296,"2020448424":296,"2020448425":296,"2020448426":296,"2020448427":296,"2020588139":521,"2020588140":521,"2020590688":521,"2020590689":521,"2020590690":521,"2020593528":521,"2020593529":521,"2020593530":521,"2020593531":521,"2020611525":570,"2020611526":570,"2020611527":570,"2020611528":570,"2020614612":570,"2020614613":570,"2020614614":570,"2020614615":570,"2020624237":367,"2020624239":367,"2030879967":1342,"2030883152":1342,"2030883154":1342,"2030883155":1342,"2030883156":1342,"2039041338":971,"2039045404":896,"2039045405":896,"2053116766":271.2,"2053116768":271.2,"2053116769":271.2,"2053119759":271.2,"2053119760":271.2,"2053119761":271.2,"2053119762":271.2,"2053119763":271.2,"2053130330":271.2,"2053139548":271.2,"2053171882":106.2,"2055875972":25.2,"2055875973":25.2,"2055875974":25.2,"2055875975":25.2,"2055875976":25.2,"2055878640":25.2,"2055878641":25.2,"2055926220":522.75,"2055930914":522.75,"2055951914":570,"2055951915":570,"2055955278":570,"2055958873":1346,"2055995275":183,"2055997156":183,"2055997157":183,"2055997469":183,"2055997470":183,"2055998542":183,"2055998543":183,"2059237947":296,"2059237948":296,"2059237949":296,"2063454861":423,"2063463923":431,"2063463924":431,"2063467616":431,"2063467617":431,"2063470003":431,"2063470004":431,"2063476198":431,"2063476199":431,"2063506950":660,"2063506951":660,"2066086536":281,"2066086537":281,"2066110680":427.8,"2066110682":427.8,"2066110683":427.8,"2066110684":427.8,"2066112869":427.8,"2066112871":427.8,"2066112872":427.8,"2066112873":427.8,"2066116011":454.8,"2066116012":454.8,"2066123141":454.8,"2066123144":454.8,"2066123145":454.8,"2085246085":483,"2085246086":483,"2085246087":483,"2085246088":483,"2085249761":483,"2085249762":483,"2085249763":483,"2085249764":483,"2085253488":323.4,"2085253489":323.4,"2086370591":483,"2086370592":483,"2087378773":427.8,"2087378775":427.8,"2087378776":427.8,"2087378777":427.8,"2099562375":91.5,"2099562376":91.5,"2100016412":157,"2100508795":333,"2100508796":333,"2100508797":333,"2102611529":333,"2113451835":1481,"2113451836":1481,"2113451838":1481,"2113451839":1481,"2113462565":1481,"2113462566":1481,"2113462568":1481,"2113462569":1481,"2113471707":1481,"2113471708":1481,"2113471710":1481,"2113471711":1481,"2113474405":1481,"2113474406":1481,"2113474407":1481,"2113474408":1481,"2113474409":1481,"2115505155":381.6,"2115505156":381.6,"2115505157":381.6,"2115542529":456,"2115542530":456,"2121075833":901.85,"2121079183":901.85,"2121169801":309.6,"2121169802":309.6,"2121169803":309.6,"2121169804":309.6,"2121170701":309.6,"2121170702":309.6,"2121170703":309.6,"2121170704":309.6,"2124737326":335.25,"2124737329":335.25,"2124737330":335.25,"2127330597":213.85,"2127338066":213.85,"2127338072":213.85,"2129895965":326.2,"2129904437":326.2,"2134617671":335.25,"2136668887":296,"2136668888":296,"2136668889":296,"2136668890":296,"2143918121":146.9,"2143918123":146.9,"2143918125":146.9,"2143918126":146.9,"2143920557":146.9,"2143920559":146.9,"2143920560":146.9,"2143920561":146.9,"2143924728":115.05,"2143926090":115.05,"2143926092":115.05,"2143926093":115.05,"2143926094":115.05,"2186361653":105.4,"2186376797":105.4,"2186376798":105.4,"2193282486":236.6,"2193282488":236.6,"2209364263":1346,"2216725669":258,"2216725671":258,"2216725672":258,"2216725673":258,"2216726748":258,"2216726750":258,"2216726751":258,"2216726752":258,"2216728884":258,"2216728886":258,"2216728887":258,"2216728888":258,"2216734913":258,"2216734915":258,"2216734916":258,"2216734917":258,"2250373909":48,"2250376386":48,"2250379336":48,"2250380692":48,"2250383818":48,"2250387379":48,"2250540322":48,"2251596602":408,"2251596603":408,"2252751153":67,"2252751154":67,"2252752670":67,"2252752671":67,"2252755261":67,"2252755262":67,"2252757259":67,"2252757260":67,"2252773426":318,"2252773427":318,"2252780093":1121,"2252796708":1121,"2282448834":1687,"2282448835":1687,"2282457575":1687,"2282457576":1687,"2285077092":585,"2285082731":585,"2290456865":502,"2298156372":2467,"2298156373":2467,"2321646545":1492,"2321646546":1492,"2321646547":1492,"2321646548":1492,"2321646549":1492,"2321646550":1492,"2322288577":1492,"2328357589":1492,"2328357590":1492,"2328357591":1492,"2328357592":1492,"2328357593":1492,"2328357594":1492,"2328357595":1492,"2328880090":1492,"2328880091":1492,"2328913658":1492,"2328913659":1492,"2328913660":1492,"2328913661":1492,"2328913662":1492,"2328913663":1492,"2328913664":1492,"2328915358":955.2,"2328915362":955.2,"2328915363":955.2,"2328917802":955.2,"2328917803":955.2,"2328921830":955.2,"2328924202":955.2,"2328924203":955.2,"2328928959":254.8,"2328928960":254.8,"2328928961":254.8,"2328928962":254.8,"2328928963":254.8,"2328928964":254.8,"2328971997":254.8,"2328975274":254.8,"2328975275":254.8,"2328975276":254.8,"2328975278":254.8,"2328975279":254.8,"2329010174":193.5,"2329010177":193.5,"2329010178":193.5,"2329010179":193.5,"2329010180":193.5,"2329019534":193.5,"2329025415":258,"2329025416":258,"2329025417":258,"2329025418":258,"2329028842":258,"2329028843":258,"2329028844":258,"2329028845":258,"2329033530":258,"2329033531":258,"2329041079":345,"2329041080":345,"2329041081":345,"2329041082":345,"2329043854":345,"2329043855":345,"2329043856":345,"2329043857":345,"2329047968":193.5,"2329047969":193.5,"2329047970":193.5,"2329050725":345,"2329050726":345,"2329050727":345,"2329050728":345,"2329635320":333,"2329635321":333,"2329635322":333,"2329635323":333,"2329635662":333,"2329636321":333,"2329636322":333,"2329636323":333,"2329636324":333,"2329636483":333,"2329636484":333,"2329636485":333,"2329636486":333,"2329637600":1342,"2329637601":1342,"2329637602":1342,"2329637603":1342,"2329637604":1342,"2329637605":1342,"2329637606":1342,"2329638357":1342,"2329638358":1342,"2329638359":1342,"2329638360":1342,"2329638361":1342,"2329638362":1342,"2329638363":1342,"2329638938":1342,"2329638939":1342,"2329638940":1342,"2329638941":1342,"2329638942":1342,"2329638943":1342,"2329638944":1342,"2329784442":1342,"2332190469":2467,"2332190470":2467,"2332190910":2467,"2332190911":2467,"2332191195":147,"2332191622":71,"2332191623":71,"2332191939":71,"2332191940":71,"2332192133":71,"2332192134":71,"2332197646":165.75,"2332197647":165.75,"2333482561":1267,"2333482562":1267,"2333482563":1267,"2333515112":83,"2333515113":83,"2333515114":73,"2333515115":73,"2333521960":83,"2333521961":83,"2333521962":83,"2333521963":83,"2333522946":83,"2333524265":83,"2333524858":83,"2333524859":83,"2333524860":83,"2333524861":83,"2333536559":1677.6,"2333536560":1677.6,"2333536561":1677.6,"2333537872":1677.6,"2333537873":1677.6,"2333537874":1677.6,"2333542234":1042,"2333542235":1042,"2333543778":1042,"2334409257":521,"2334409258":521,"2334409259":521,"2334409260":521,"2334446392":79.2,"2334446736":79.2,"2334448592":79.2,"2334464410":633,"2334464411":633,"2334464412":633,"2334464413":633,"2334464414":633,"2334483052":2088,"2334483055":2088,"2334483056":2088,"2334483057":2088,"2334486503":2088,"2334486504":2088,"2334486505":2088,"2334486506":2088,"2334486507":2088,"2334486508":2088,"2334492116":2088,"2335745369":375,"2335745370":375,"2335745371":375,"2335745372":375,"2335745373":375,"2335749468":375,"2335749469":375,"2335749470":375,"2335749471":375,"2335749472":375,"2335754701":375,"2335754703":375,"2335754705":375,"2335754706":375,"2335754707":375,"2335761796":375,"2335761797":375,"2335765121":375,"2335765122":375,"2335765123":375,"2335765124":375,"2335765125":375,"2335797712":296,"2335797713":296,"2335797714":296,"2335797715":296,"2335797716":296,"2335801118":296,"2335801119":296,"2335801120":296,"2335801121":296,"2335801122":296,"2335807862":157.85,"2335824050":1687,"2335824051":1687,"2335825865":1687,"2335825866":1687,"2353644142":221,"2353645308":221,"2353645309":221,"2353649120":438,"2353652990":438,"2353660202":438,"2353663191":438,"2372377181":1672,"2372377183":1672,"2372377184":1672,"2372377185":1672,"2372377186":1672,"2372377187":1672,"2372409652":1672,"2372409653":1672,"2372409654":1672,"2372409655":1672,"2372409656":1672,"2372409657":1672,"2372409658":1672,"2372418983":1672,"2372418984":1672,"2372418985":1672,"2372422234":1672,"2372422235":1672,"2372451214":471.8,"2372451215":471.8,"2372451216":471.8,"2372451217":471.8,"2372451218":471.8,"2372451219":471.8,"2372451220":471.8,"2372457099":471.8,"2372457100":471.8,"2372457101":471.8,"2372498033":471.8,"2389568054":1338,"2389568055":1338,"2389568056":1338,"2389568057":1338,"2389568058":1338,"2389568059":1338,"2389568060":1338,"2389571071":1338,"2389571072":1338,"2389571073":1338,"2389571074":1338,"2389571075":1338,"2389571076":1338,"2389571077":1338,"2396530104":742,"2396530105":742,"2396530106":742,"2396530107":742,"2396532114":742,"2396532115":742,"2396532116":742,"2396532117":742,"2396534167":742,"2396534168":742,"2396534169":742,"2396552913":483,"2396553689":483,"2396561168":521,"2396561169":521,"2396561170":521,"2396561171":521,"2396564747":495,"2396564748":521,"2396564749":521,"2396564750":521,"2396567755":521,"2396567756":521,"2396567757":521,"2396567758":521,"2396640737":446,"2396640738":446,"2396693937":120,"2396693938":120,"2396693939":120,"2396704244":120,"2396704245":120,"2396704246":120,"2396705454":120,"2396705455":120,"2396705456":120,"2401827530":2242,"2401827531":2242,"2401833286":2242,"2401833287":2242,"2401848438":416,"2401848439":416,"2401849288":416,"2401849289":416,"2401850296":416,"2401850297":416,"2401875097":1496,"2401875098":1496,"2401885941":521,"2401894915":521,"2437714532":1312,"2437717801":1312,"2437720299":967,"2437721572":967,"2437724146":618.4,"2437825187":937,"2437825188":937,"2437825189":937,"2437825190":937,"2437826982":937,"2437826983":937,"2437826984":937,"2437826985":937,"2437834531":746,"2437834532":746,"2437834533":746,"2437834534":746,"2437838093":746,"2440039636":885,"2440039638":885,"2440039640":885,"2440039641":885,"2440039642":885,"2440045995":885,"2440045996":885,"2440045997":885,"2440045998":885,"2440045999":885,"2440046000":885,"2440046001":885,"2440048856":885,"2440056362":885,"2440109575":315.25,"2440109576":315.25,"2440109577":315.25,"2440109578":315.25,"2440109579":315.25,"2440109580":315.25,"2440109581":315.25,"2440114645":315.25,"2440114646":315.25,"2440114647":315.25,"2440114648":315.25,"2440114649":315.25,"2440114650":315.25,"2440114651":315.25,"2440120726":315.25,"2440120727":315.25,"2440120728":315.25,"2440120729":315.25,"2440120730":315.25,"2440120731":315.25,"2440120732":315.25,"2440181680":431,"2440181681":431,"2440185222":431,"2440185223":431,"2440185224":431,"2440185225":431,"2440188659":431,"2440188660":431,"2440188661":431,"2440188662":431,"2444723227":712.5,"2444723228":712.5,"2444723229":712.5,"2444723230":712.5,"2444723231":712.5,"2444723232":712.5,"2444723233":712.5,"2444726360":712.5,"2444728753":712.5,"2444728754":712.5,"2444757386":371,"2444757387":371,"2444757388":371,"2444757389":371,"2444757390":371,"2444757391":371,"2444757392":371,"2444759161":208.5,"2444762218":208.5,"2444762219":208.5,"2444762220":208.5,"2444762221":208.5,"2444762222":208.5,"2444762223":208.5,"2444762224":208.5,"2445003829":348,"2445003830":348,"2445003831":348,"2445003832":348,"2445003833":348,"2445003834":348,"2445003835":348,"2445005918":348,"2445005919":348,"2445005920":348,"2445005921":348,"2445005922":348,"2445005923":348,"2445005924":348,"2445006666":348,"2445006667":348,"2445008354":348,"2445008355":348,"2445008356":348,"2445008357":348,"2445008358":348,"2445008359":348,"2445008360":348,"2446999230":735,"2446999231":735,"2446999232":735,"2446999233":735,"2446999234":735,"2446999235":735,"2446999976":735,"2446999977":735,"2447000955":735,"2447002163":735,"2447002164":735,"2447002165":735,"2447002166":735,"2447002167":735,"2447002168":735,"2447002169":735,"2450688523":971,"2450688524":971,"2450688525":971,"2450688526":971,"2450691569":971,"2450691570":971,"2450691571":971,"2450691572":971,"2453863206":345,"2453893651":345,"2453893652":345,"2453893653":345,"2470091740":442,"2470091741":442,"2470092737":1196,"2470095546":1196,"2471189686":1131.75,"2471189687":1131.75,"2471189688":1131.75,"2471189689":1131.75,"2471204832":1131.75,"2471204833":1131.75,"2471204834":1131.75,"2471204835":1131.75,"2471217222":1131.75,"2471217223":1131.75,"2471217224":1131.75,"2471217225":1131.75,"2471222693":1131.75,"2471222694":1131.75,"2471222695":1131.75,"2471222696":1131.75,"2471230140":662.4,"2471230141":662.4,"2471230142":662.4,"2471230144":828,"2471230695":1035,"2471230696":1035,"2471230697":1035,"2471231175":1035,"2471231176":1035,"2471231177":1035,"2471231178":1035,"2471275041":1098,"2471275042":1098,"2471276409":1098,"2471276410":1098,"2471276411":1098,"2471277435":1098,"2471277436":1098,"2471277437":1098,"2474583020":521,"2474583023":521,"2474583025":521,"2474583026":521,"2474591179":521,"2474591180":521,"2474591181":521,"2474591182":521,"2474592327":521,"2474592328":521,"2474592329":521,"2474592330":521,"2474603219":521,"2474603220":521,"2474603221":521,"2474603222":521,"2474670047":1792,"2474671940":1792,"2474671941":1792,"2474671942":1792,"2474671943":1792,"2474674678":663,"2474674679":663,"2474674680":663,"2474674681":663,"2474675651":663,"2474675652":663,"2474675653":663,"2474675654":663,"2474677220":663,"2474677221":663,"2474677222":663,"2474677223":663,"2474678607":663,"2474678608":663,"2474678609":663,"2474678610":663,"2474680090":663,"2474680091":663,"2474680092":663,"2474680093":663,"2474680874":663,"2474680875":663,"2474680876":663,"2474680877":663,"2484546974":2088,"2484546975":2088,"2484550870":2088,"2484555430":2088,"2484558200":2088,"2484558201":2088,"2484558202":2088,"2484558203":2088,"2487058663":1788,"2487058664":1788,"2487058665":1788,"2487058666":1788,"2487059845":1788,"2487059846":1788,"2487059847":1788,"2487059848":1788,"2487061335":1788,"2487061336":1788,"2487061337":1788,"2487061338":1788,"2487062913":1788,"2487062914":1788,"2487062915":1788,"2487062916":1788,"2506346992":655.9,"2506346996":655.9,"2506346997":655.9,"2506346998":655.9,"2506348556":655.9,"2506348557":655.9,"2506348559":655.9,"2506348560":655.9,"2506348561":655.9,"2506348562":655.9,"2507836622":648,"2507841619":648,"2511717332":135,"2511727212":135,"2513212461":648,"2513212810":648,"2513215013":648,"2513216154":648,"2513243484":60,"2513245417":60,"2513247215":60,"2513252220":60,"2513252409":60,"2513252698":60,"2513257510":60,"2513259437":60,"2541678806":1421,"2541678807":1421,"2541678808":1421,"2541685999":1421,"2541686000":1421,"2541686001":1421,"2541689144":1421,"2541689145":1421,"2541689146":1421,"2546156364":1710,"2546157840":1710,"2546157841":1710,"2546157842":1710,"2546157843":1710,"2546157844":1710,"2546157845":1710,"2546157846":1710,"2546162522":1710,"2546162523":1710,"2546162524":1710,"2546162525":1710,"2546162526":1710,"2546162527":1710,"2546162528":1710,"2546165495":1710,"2546165496":1710,"2546165497":1710,"2546165498":1710,"2546165499":1710,"2546165500":1710,"2546165501":1710,"2546171352":273,"2546171353":273,"2546176030":273,"2546176031":273,"2547772071":258,"2547772072":258,"2547777389":258,"2547777390":258,"2547912944":648,"2547912945":648,"2547912946":648,"2547912947":648,"2547957002":648,"2547997366":648,"2548004078":596,"2548004082":596,"2548499956":108,"2548500825":108,"2548505152":108,"2548505943":108,"2548509985":123,"2548509987":123,"2548509988":123,"2548511629":123,"2548513703":123,"2548519487":335.25,"2548532680":296,"2548532681":296,"2548532682":296,"2548534725":146.9,"2548534726":146.9,"2548534727":146.9,"2548534728":146.9,"2548534729":146.9,"2548534730":146.9,"2548541570":133.2,"2548541571":133.2,"2548541572":133.2,"2548541573":133.2,"2548541574":133.2,"2548541575":133.2,"2552282227":521,"2552282228":521,"2552282229":521,"2552283111":521,"2552283989":521,"2552283990":521,"2552283991":521,"2552283992":521,"2552283993":521,"2552285252":521,"2552285253":521,"2552285254":521,"2552285255":521,"2552285256":521,"2559335195":108,"2559347901":135,"2559368950":273,"2559368951":273,"2559378807":877,"2559433412":208.5,"2559433413":208.5,"2559435747":208.5,"2559445283":175.2,"2559445284":175.2,"2559445285":175.2,"2559445286":175.2,"2559445287":175.2,"2559453466":175.2,"2559453467":175.2,"2559456443":175.2,"2559456444":175.2,"2559456445":175.2,"2559456447":175.2,"2559458837":175.2,"2559458838":175.2,"2559462133":175.2,"2559462134":175.2,"2559467386":175.2,"2559471001":175.2,"2559476413":333,"2559476414":333,"2559476415":333,"2559476416":333,"2559476417":333,"2559476418":333,"2559478796":333,"2559478797":333,"2559478798":333,"2559478799":333,"2559478800":333,"2559478801":333,"2559491932":250.5,"2559491933":250.5,"2559491934":250.5,"2559491935":250.5,"2559491936":250.5,"2559491937":250.5,"2578041244":345,"2578041245":345,"2578041634":345,"2578041635":345,"2578041636":345,"2578042040":345,"2578042041":345,"2578042042":345,"2578042253":345,"2578042254":345,"2578042255":345,"2582185643":221,"2582185644":221,"2582185645":221,"2582193484":502,"2582195976":502,"2582198732":296,"2582198733":296,"2582198734":296,"2582198735":296,"2582198736":296,"2582200794":296,"2582200795":296,"2582200796":296,"2582200797":296,"2582200798":296,"2582206135":296,"2582206136":296,"2582206137":296,"2582206138":296,"2582206139":296,"2582209055":296,"2582209056":296,"2582209057":296,"2582209059":296,"2582209060":296,"2582213291":333,"2582213292":333,"2582213293":333,"2582213294":333,"2582213295":333,"2582216099":333,"2582216100":333,"2582216101":333,"2582216102":333,"2582216103":333,"2582219142":333,"2582219143":333,"2582219144":333,"2582219145":333,"2582219146":333,"2582223828":352,"2582223829":352,"2582226770":352,"2582226771":352,"2582247562":296,"2582252473":296,"2582252474":296,"2582252475":296,"2582252476":296,"2582252477":296,"2582259348":296,"2582259349":296,"2582259350":296,"2582264345":1046,"2582264346":1046,"2582264347":1046,"2582264348":1046,"2582274564":483,"2582278298":483,"2582278299":483,"2582278300":483,"2582278301":483,"2582278302":483,"2582278303":483,"2582283073":483,"2582283074":483,"2582283075":483,"2582283076":483,"2582283077":483,"2582283078":483,"2582284795":483,"2582289118":221,"2582289119":221,"2582293044":221,"2582293045":221,"2582293046":221,"2582293047":221,"2582306426":648,"2583023908":146,"2583023909":146,"2583024733":146,"2583024734":146,"2583031903":250.5,"2583031904":250.5,"2583031905":250.5,"2583031906":250.5,"2583031907":250.5,"2583031908":250.5,"2596875698":236.8,"2596875700":236.8,"2596875701":236.8,"2596875702":236.8,"2596875703":236.8,"2596875704":236.8,"2596880095":236.8,"2596880097":236.8,"2596880098":236.8,"2596880099":236.8,"2596880100":236.8,"2596880101":236.8,"2596886294":236.8,"2596886295":236.8,"2596886296":236.8,"2596886297":236.8,"2596886298":236.8,"2596886299":236.8,"2596886300":236.8,"2596891509":195.75,"2596891510":195.75,"2596892923":195.75,"2596892924":195.75,"2596892925":195.75,"2596892926":195.75,"2596892927":195.75,"2596892928":195.75,"2596892929":195.75,"2596897288":195.75,"2596913619":250.5,"2596915470":250.5,"2596915471":250.5,"2596915472":250.5,"2596915473":250.5,"2596915474":250.5,"2596915475":250.5,"2596915476":250.5,"2596916988":250.5,"2596916989":250.5,"2596941066":742,"2600850259":108,"2600851445":108,"2624142460":352,"2624142461":352,"2624143857":146,"2624143858":146,"2626342103":221,"2626342104":221,"2626342105":221,"2626342106":221,"2626343530":221,"2626343531":221,"2626343532":221,"2626343533":221,"2626345382":221,"2626345383":221,"2626345384":221,"2626345385":221,"2626362520":333,"2626362521":333,"2626364465":333,"2626367632":333,"2626369093":333,"2626369094":333,"2626369095":333,"2626369096":333,"2632648586":146.9,"2632648587":146.9,"2632648588":146.9,"2632648589":146.9,"2632648590":146.9,"2632648591":146.9,"2632648592":146.9,"2633846891":183,"2633846892":183,"2633846893":183,"2633846894":183,"2633846895":183,"2633846896":183,"2633846897":183,"2633851103":183,"2633851104":183,"2633851105":183,"2633851106":183,"2633851107":183,"2633858633":183,"2633860074":183,"2633860075":183,"2633860076":183,"2633860077":183,"2633860078":183,"2633860079":183,"2633860080":183,"2633860883":183,"2633860884":183,"2633860885":183,"2633860886":183,"2633860887":183,"2633860888":183,"2633860889":183,"2633861371":183,"2633861372":183,"2633861373":183,"2633861374":183,"2633861375":183,"2633861376":183,"2633861377":183,"2633861969":183,"2633861970":183,"2633861971":183,"2633861972":183,"2633861973":183,"2633861974":183,"2633861975":183,"2634653550":115.05,"2634653551":115.05,"2634653552":115.05,"2634653553":115.05,"2634653554":115.05,"2634653555":115.05,"2635576208":667,"2635576209":667,"2635576210":667,"2635576211":667,"2635576212":667,"2635576213":667,"2635576214":667,"2635578406":667,"2635578407":667,"2635578408":667,"2635578409":667,"2635578410":667,"2635578411":667,"2635578412":667,"2635585565":667,"2635585566":667,"2635585567":667,"2635585568":667,"2635585569":667,"2635603620":513,"2635603622":513,"2635603624":513,"2635608270":513,"2635608271":513,"2635608272":513,"2635608273":513,"2635608274":513,"2635608275":513,"2635608276":513,"2635610389":513,"2635610390":513,"2635610391":513,"2635610392":513,"2635610393":513,"2635610394":513,"2635610395":513,"2635620012":705,"2635620013":705,"2635620014":705,"2635620015":705,"2635620016":705,"2635620017":705,"2635620018":705,"2635625406":705,"2635625407":705,"2635625408":705,"2635625409":705,"2635625410":705,"2635625411":705,"2635625412":705,"2635635270":705,"2635646439":513,"2635646440":513,"2635646441":513,"2635646442":513,"2635646443":513,"2635646444":513,"2635646445":513,"2635647516":513,"2635647517":513,"2635647518":513,"2635647519":513,"2635647520":513,"2635647521":513,"2635647522":513,"2635649400":513,"2635649401":513,"2635649402":513,"2635649403":513,"2635649404":513,"2635649405":513,"2635649406":513,"2643931670":967,"2643933106":967,"2643933493":967,"2643962109":821,"2643962113":821,"2643962115":821,"2643962117":821,"2643962119":821,"2643964198":821,"2643964199":821,"2643964200":821,"2643964201":821,"2643964202":821,"2643968286":798,"2643968287":798,"2643968288":798,"2643968289":798,"2643970966":798,"2643970967":798,"2643970968":798,"2643970969":798,"2643970970":798,"2654022339":483,"2654022340":483,"2654022341":483,"2654022342":483,"2654024143":483,"2654024144":483,"2654024145":483,"2654024146":483,"2654088008":423,"2654088009":423,"2654088992":423,"2654104606":393,"2654104607":393,"2654107551":393,"2654107554":393,"2654117664":821,"2654119732":821,"2654150573":705,"2654150574":705,"2654150575":705,"2654150576":705,"2654150577":705,"2654150578":705,"2654150579":705,"2656598761":71,"2656598762":71,"2656598763":71,"2656598764":71,"2656599255":71,"2656599256":71,"2656599257":71,"2656599258":71,"2656776376":551,"2657546875":48,"2657550669":48,"2667999636":618,"2668207036":333,"2668207037":333,"2668207038":333,"2668207039":333,"2668207040":333,"2680235028":48,"2680239889":48,"2680270941":583.8,"2680302045":221,"2680302046":221,"2680303843":221,"2680303844":221,"2680318488":273,"2680318489":273,"2686541485":1117,"2686541486":1117,"2686541487":1117,"2686541488":1117,"2686541489":1117,"2686541490":1117,"2686541491":1117,"2686542894":1117,"2686542895":1117,"2686542896":1117,"2686542897":1117,"2686542898":1117,"2686542899":1117,"2686542900":1117,"2686543653":1117,"2686543654":1117,"2686543655":1117,"2686543656":1117,"2686543657":1117,"2686543658":1117,"2686543659":1117,"2686545635":1117,"2686545636":1117,"2686545638":1117,"2686545639":1117,"2686545640":1117,"2686545641":1117,"2686548147":1117,"2686548148":1117,"2686548149":1117,"2686548150":1117,"2686548151":1117,"2686548152":1117,"2686550703":1117,"2686550704":1117,"2686550705":1117,"2686550706":1117,"2686550707":1117,"2686550708":1117,"2686556126":1117,"2686556127":1117,"2686556128":1117,"2686556129":1117,"2686556130":1117,"2686556131":1117,"2686557733":1117,"2686557734":1117,"2686557735":1117,"2686557736":1117,"2686557737":1117,"2686557738":1117,"2686565219":2538,"2686565220":2538,"2686565221":2538,"2686565222":2538,"2686565941":2538,"2686565942":2538,"2686565943":2538,"2686565944":2538,"2686566211":2538,"2686566212":2538,"2686566213":2538,"2686566214":2538,"2686567366":2538,"2686567367":2538,"2686567368":2538,"2686567369":2538,"2688304257":2238,"2688309100":2238,"2688310355":2238,"2688321112":2013,"2688321709":2013,"2688339797":2013,"2688344158":2013,"2688370120":2088,"2688370121":2088,"2688370122":2088,"2688370123":2088,"2688371548":2088,"2688371549":2088,"2688371550":2088,"2688371551":2088,"2688373939":2088,"2688386466":2838,"2688386467":2838,"2688386468":2838,"2688386469":2838,"2688388705":2838,"2688388706":2838,"2688388707":2838,"2688388708":2838,"2688403346":2238,"2688403347":2238,"2688403348":2238,"2688403349":2238,"2688411357":2238,"2688414559":2238,"2688417140":2238,"2688417141":2238,"2688417142":2238,"2688417143":2238,"2688434552":1485,"2688434553":1485,"2688434554":1485,"2688434555":1485,"2688434556":1485,"2688434557":1485,"2688434558":1485,"2688444494":1485,"2688444495":1485,"2688444496":1485,"2688444497":1485,"2688447560":1485,"2688450232":1485,"2688450233":1485,"2688450234":1485,"2688450235":1485,"2688450236":1485,"2688450237":1485,"2688450238":1485,"2693855537":667,"2693855539":667,"2693855541":667,"2693855542":667,"2693855544":667,"2693855545":667,"2693855547":667,"2693858372":667,"2693858373":667,"2693858374":667,"2693858375":667,"2693858376":667,"2693858377":667,"2693858378":667,"2693867325":521,"2693870968":521,"2693874259":558,"2693876029":558,"2701717632":483,"2701717633":483,"2701717634":483,"2701717635":483,"2701717636":483,"2701717637":483,"2701718911":483,"2701718912":483,"2701718913":483,"2701718914":483,"2702731896":1346,"2741512791":1042,"2741513186":1117,"2741513187":1117,"2741513188":1117,"2741513189":1117,"2741513190":1117,"2741513191":1117,"2741514216":618,"2741519738":618,"2741528141":592,"2741530217":592,"2741532278":592,"2741534100":592,"2741553150":232,"2741553151":232,"2741553152":232,"2741553153":232,"2741564515":232,"2741564516":232,"2741564517":232,"2741566863":232,"2741778732":2163,"2741778733":2163,"2741778734":2163,"2741778735":2163,"2741778736":2163,"2741778737":2163,"2741778738":2163,"2741804114":2238,"2741804115":2238,"2741804116":2238,"2741804117":2238,"2741804118":2238,"2741804119":2238,"2741804120":2238,"2741807367":2238,"2741807368":2238,"2741807369":2238,"2741807370":2238,"2741807371":2238,"2741807372":2238,"2741807373":2238,"2741809182":2238,"2741809183":2238,"2741809184":2238,"2741809185":2238,"2741809186":2238,"2741809187":2238,"2741809188":2238,"2741821354":1777,"2741826037":1777,"2741828036":1777,"2741857903":110,"2741861715":135,"2741864375":150,"2741866093":110,"2741866680":120,"2741867595":135,"2741869256":150,"2741870737":110,"2741871774":120,"2741872466":135,"2741902863":558,"2741905710":558,"2741909400":558,"2741985869":498,"2741985870":498,"2741985871":498,"2741985872":498,"2741985873":498,"2741989994":498,"2741989995":498,"2741989996":498,"2741989997":498,"2741989998":498,"2741993486":498,"2741993487":498,"2741993488":498,"2741993489":498,"2741993490":498,"2741996986":498,"2741996987":498,"2741996988":498,"2741996989":498,"2741996990":498,"2741999897":498,"2742002823":585,"2742005763":585,"2742009417":585,"2742009418":585,"2742011955":585,"2742011956":585,"2742011957":585,"2742011958":585,"2742011959":585,"2742015716":585,"2742015717":585,"2742015718":585,"2742015719":585,"2742015720":585,"2784431762":318,"2784431763":318,"2784432292":318,"2784442205":183,"2784442206":183,"2784442207":183,"2784442208":183,"2784442209":183,"2786085432":1338,"2786085433":1338,"2786085434":1338,"2786085435":1338,"2786085436":1338,"2786100989":345,"2786100990":345,"2786100991":345,"2786104600":345,"2786104601":345,"2786104602":345,"2786108398":345,"2786108399":345,"2786108400":345,"2786116462":345,"2786116463":345,"2786116464":345,"2786124431":345,"2786124432":345,"2786124433":345,"2801445261":333,"2801445262":333,"2801445263":333,"2801445264":333,"2801445591":333,"2801445592":333,"2801445593":333,"2801445594":333,"2801445670":333,"2801445671":333,"2801445672":333,"2801445673":333,"2801445754":333,"2801445755":333,"2801445871":333,"2801445872":333,"2801445873":333,"2801445874":333,"2801447787":333,"2801447788":333,"2801447789":333,"2801447790":333,"2801448222":333,"2801448223":333,"2801448224":333,"2801448225":333,"2801450088":333,"2801450089":333,"2801450090":333,"2801450091":333,"2814404028":517,"2814404029":517,"2814404663":517,"2814419530":517,"2814419531":517,"2814420425":517,"2814420635":517,"2816782882":183,"2818806172":183,"2829567032":363,"2829567033":363,"2829567034":363,"2829567035":363,"2829567036":363,"2829567037":363,"2829567038":363,"2829567585":363,"2829567586":363,"2829567587":363,"2829567588":363,"2829567589":363,"2829567590":363,"2829567591":363,"2829567938":363,"2829567939":363,"2829567940":363,"2829567941":363,"2829567942":363,"2829567943":363,"2829574396":435,"2829574397":435,"2829575586":435,"2829575587":435,"2829577774":435,"2829577775":435,"2829577776":435,"2829577777":435,"2829577778":435,"2829577779":435,"2829577780":435,"2829580734":435,"2829580735":435,"2829580736":435,"2829580737":435,"2829580738":435,"2829580739":435,"2829580740":435,"2829593227":521,"2829593228":521,"2829593229":521,"2829593230":521,"2829594335":521,"2829594336":521,"2829594337":521,"2829594338":521,"2829596615":967,"2829603727":1035,"2829603728":1035,"2829603729":1035,"2829603730":1035,"2830275107":592,"2830275108":592,"2830275109":592,"2830275110":592,"2830275766":592,"2830280318":513,"2830280319":513,"2830280320":513,"2830280321":513,"2830292929":513,"2830292930":513,"2830292931":513,"2830292932":513,"2830293931":513,"2830293932":513,"2830293933":513,"2830293934":513,"2830295447":513,"2830295448":513,"2830295449":513,"2830295450":513,"2830311175":558,"2830311176":558,"2830311733":558,"2830311734":558,"2830312177":558,"2830312178":558,"2830684678":183,"2849131761":483,"2849131762":483,"2849131763":483,"2849131764":483,"2849131765":483,"2849131766":483,"2849131767":483,"2849133871":483,"2849133872":483,"2849133873":483,"2849133874":483,"2849133875":483,"2849133876":483,"2849133877":483,"2849134414":483,"2849134415":483,"2849134416":483,"2849134417":483,"2849134418":483,"2849134419":483,"2849134420":483,"2849136507":720,"2849136508":720,"2849136509":720,"2849136510":720,"2849136511":720,"2849136512":720,"2849136513":720,"2849137666":720,"2849137667":720,"2849137668":720,"2849137669":720,"2849137670":720,"2849137671":720,"2849137672":720,"2849139319":720,"2849139320":720,"2849139321":720,"2849139322":720,"2849139323":720,"2849139324":720,"2849139325":720,"2849145190":333,"2849145191":333,"2849147710":333,"2849147711":333,"2849147712":333,"2849147713":333,"2849147714":333,"2849147715":333,"2849147716":333,"2849161460":333,"2849161461":333,"2849161462":333,"2849161463":333,"2849161464":333,"2849161465":333,"2849161466":333,"2849169665":333,"2849169666":333,"2849169667":333,"2849169668":333,"2849169669":333,"2849169670":333,"2849169671":333,"2849191299":333,"2849191300":333,"2849191301":333,"2849191302":333,"2849191303":333,"2849191304":333,"2849191305":333,"2849208891":333,"2849208892":333,"2849212106":333,"2849212107":333,"2849220472":333,"2849220473":333,"2850402353":1312,"2853900565":446,"2853900566":446,"2853901460":446,"2853901461":446,"2853902587":446,"2853902588":446,"2853903204":446,"2853903205":446,"2853910364":416,"2859783366":667,"2859783367":667,"2859783368":667,"2859783369":667,"2859783370":667,"2859783371":667,"2859785571":667,"2859785572":667,"2859793090":667,"2859793091":667,"2859793092":667,"2859793093":667,"2859793094":667,"2859793095":667,"2859793096":667,"2859796656":667,"2859796657":667,"2859796658":667,"2859796659":667,"2859796660":667,"2859796661":667,"2859796662":667,"2864628566":663,"2864628567":663,"2864628568":663,"2864628569":663,"2864628570":663,"2864628571":663,"2864628572":663,"2864640179":663,"2864640180":663,"2864640181":663,"2864640182":663,"2864640183":663,"2864640184":663,"2864640185":663,"2864642803":663,"2864642804":663,"2864642805":663,"2864642806":663,"2864642807":663,"2864642808":663,"2864642809":663,"2864644935":663,"2864644936":663,"2864668067":630,"2864668068":630,"2864668069":630,"2864668070":630,"2864668209":630,"2864668210":630,"2864668211":630,"2864668212":630,"2864670286":630,"2864670287":630,"2864670288":630,"2864670289":630,"2864682419":588,"2864682420":588,"2864682421":588,"2864682422":588,"2864684969":588,"2864687397":588,"2864687398":588,"2864687399":588,"2864687400":588,"2864687401":588,"2864687402":588,"2864687403":588,"2864688258":588,"2864688259":588,"2864688260":588,"2864688261":588,"2864688262":588,"2864688263":588,"2864688264":588,"2864700717":521,"2864700718":521,"2864700719":521,"2864700720":521,"2864702416":521,"2864702417":521,"2864702418":521,"2864702419":521,"2864703341":521,"2864703342":521,"2864703343":521,"2864703344":521,"2864704019":521,"2864704020":521,"2864704021":521,"2864704022":521,"2864705636":671,"2864707197":671,"2864708709":671,"2864708988":671,"2864709112":671,"2864709679":671,"2864709851":671,"2864710749":671,"2881705962":1417,"2881705963":1417,"2881705964":1417,"2881705965":1417,"2881705966":1417,"2881705967":1417,"2881705968":1417,"2881711574":1417,"2881711575":1417,"2881711576":1417,"2881711577":1417,"2881711578":1417,"2881711579":1417,"2881711580":1417,"2881714377":1417,"2881714378":1417,"2881714379":1417,"2881717309":1417,"2881722347":1417,"2881722348":1417,"2881722349":1417,"2881722350":1417,"2881722351":1417,"2881722352":1417,"2881722353":1417,"2883669531":896,"2883669532":896,"2883669533":896,"2883669534":896,"2883669535":896,"2883669536":896,"2883669537":896,"2883669930":896,"2883669931":896,"2883669932":896,"2883669933":896,"2883669934":896,"2883669935":896,"2883669936":896,"2883670440":896,"2883670441":896,"2883670442":896,"2883672107":896,"2883685544":648,"2883686052":648,"2883690113":90,"2883690114":90,"2883690272":90,"2883690273":90,"2883690512":90,"2883690513":90,"2883690729":90,"2883690730":90,"2894119419":258,"2894119420":258,"2894125895":258,"2894125896":258,"2894134378":281,"2894134379":281,"2894134380":281,"2894139206":281,"2894140114":281,"2894140115":281,"2894140116":281,"2894143694":281,"2894143695":281,"2894143696":281,"2894143996":281,"2894143997":281,"2894143998":281,"2894148686":1485,"2894148687":1485,"2894148688":1485,"2894148689":1485,"2894148690":1485,"2894148691":1485,"2894148692":1485,"2894149189":1485,"2894149190":1485,"2894149191":1485,"2894149192":1485,"2894149193":1485,"2894149194":1485,"2894149195":1485,"2894149551":1485,"2894149552":1485,"2894149553":1485,"2894149554":1485,"2894149555":1485,"2894149556":1485,"2894149557":1485,"2896806032":720,"2896806033":720,"2896806034":720,"2896806035":720,"2896806036":720,"2896806037":720,"2896806038":720,"2896808440":720,"2896808441":720,"2896808442":720,"2896808443":720,"2896808444":720,"2896808445":720,"2896808446":720,"2896808734":720,"2896808735":720,"2896808736":720,"2896808737":720,"2896808738":720,"2896808739":720,"2896808740":720,"2896809484":720,"2896809485":720,"2896809486":720,"2896809487":720,"2896809488":720,"2896809489":720,"2896809490":720,"2899622363":502,"2899625249":502,"2899634062":1185,"2899634063":1185,"2899634064":1185,"2899634065":1185,"2899634066":1185,"2899634067":1185,"2899634068":1185,"2899639351":1185,"2899639352":1185,"2899639353":1185,"2899639354":1185,"2899639355":1185,"2899639356":1185,"2899639357":1185,"2899648380":671,"2899648381":671,"2899648382":671,"2899648383":671,"2899648384":671,"2899648385":671,"2899648386":671,"2899659812":1642,"2899659813":1642,"2899659814":1642,"2899659815":1642,"2899659816":1642,"2899659817":1642,"2899659818":1642,"2899662314":1642,"2899662315":1642,"2899662316":1642,"2899662317":1642,"2899662318":1642,"2899662319":1642,"2899662320":1642,"2899671258":521,"2899673365":521,"2899674362":521,"2899680562":483,"2899683009":483,"2899683863":483,"2902151580":86,"2902151581":86,"2902151582":86,"2902153298":86,"2902153299":86,"2902153300":86,"2902161928":270,"2902161929":270,"2902161930":270,"2902162303":270,"2902162304":270,"2902162305":270,"2902171896":195,"2902171897":195,"2902171898":195,"2902171899":195,"2902178694":195,"2902178697":195,"2902178699":195,"2902178709":195,"2902224722":195,"2902224723":195,"2902224724":195,"2902225237":195,"2902225238":195,"2902225239":195,"2911711287":423,"2911711288":423,"2911711762":423,"2912253928":1038,"2912255314":1038,"2912255315":1038,"2912255316":1038,"2912255317":1038,"2912255318":1038,"2912255319":1038,"2912255320":1038,"2912258190":1038,"2912258191":1038,"2912258192":1038,"2912258193":1038,"2912258194":1038,"2912258195":1038,"2912258196":1038,"2912261220":1038,"2912261221":1038,"2912261222":1038,"2912261223":1038,"2912261224":1038,"2912261225":1038,"2912261226":1038,"2913254822":420,"2913254823":420,"2913254824":420,"2913254825":420,"2913254826":420,"2913254827":420,"2913254828":420,"2913256950":420,"2913256951":420,"2913256952":420,"2913256953":420,"2913256954":420,"2913256955":420,"2913256956":420,"2913258931":420,"2913260322":420,"2913682017":420,"2913682018":420,"2913682019":420,"2913682020":420,"2913682021":420,"2913682022":420,"2913682023":420,"2930598680":296,"2930598681":296,"2930598682":296,"2930598683":296,"2930598684":296,"2930600332":296,"2930600333":296,"2930600334":296,"2930600335":296,"2930600336":296,"2930603155":296,"2930635389":393,"2930639522":393,"2930642388":393,"2930642389":393,"2930644773":393,"2930644774":393,"2930658547":1263,"2930658548":1263,"2930658549":1263,"2930658550":1263,"2930658551":1263,"2930658552":1263,"2930658553":1263,"2930662675":1263,"2930662676":1263,"2930662677":1263,"2930662678":1263,"2930662679":1263,"2930662680":1263,"2930662681":1263,"2930667070":1263,"2930667071":1263,"2941700216":247,"2941700217":247,"2941700218":247,"2941702996":247,"2941702997":247,"2941702998":247,"2941706111":247,"2941706112":247,"2941706113":247,"2941706551":247,"2941706552":247,"2941706553":247,"2949513538":326,"2949513854":326,"2949520932":326,"2949535986":120,"2949536459":120,"2949538903":120,"2949541708":120,"2949580244":221,"2949598110":221,"2949598956":221,"2949606889":221,"2949608932":120,"2949657314":120,"2949670287":363,"2949670453":363,"2949679436":363,"2949680648":363,"2949688890":296,"2949705683":296,"2949707005":296,"2949708649":296,"2949712954":333,"2949724151":333,"2949725767":333,"2949735976":146,"2949736111":146,"2949738150":146,"2949739584":146,"2949901018":345,"2949946031":345,"2949947085":345,"2949948602":345,"2949950345":296,"2949953509":296,"2949954725":296,"2952759165":513,"2952759327":513,"2952761110":513,"2952761911":513,"2952810174":742,"2952820651":742,"2952824053":742,"2952831097":742,"2952832465":742,"2952859157":168,"2952859602":168,"2952873995":168,"2952875320":168,"2952922441":1387,"2952922442":1387,"2952922443":1387,"2952922444":1387,"2952922445":1387,"2952922446":1387,"2952922447":1387,"2952940909":1387,"2952940910":1387,"2952940911":1387,"2952940912":1387,"2952940913":1387,"2952940914":1387,"2952940915":1387,"2952952426":195,"2952953183":195,"2952954608":195,"2952956061":195,"2952957126":195,"2952959556":195,"2952971108":168,"2952971109":168,"2952972936":168,"2952972938":168,"2952975228":168,"2952975229":168,"2952977665":168,"2952977666":168,"2953020159":183,"2953022747":183,"2953024222":183,"2953025175":183,"2954628251":742,"2954769368":521,"2954784280":221,"2954787707":221,"2954788797":221,"2954790404":221,"2954792283":221,"2954795689":221,"2954798539":221,"2954835412":146,"2954836447":146,"2954838830":146,"2954840268":146,"2955145054":296,"2955152035":371,"2955153957":371,"2955155643":371,"2955157002":371,"2955170579":168,"2955170748":168,"2955171545":168,"2955172325":168,"2955176983":60,"2955181406":60,"2955182372":60,"2956697484":573,"2956697485":573,"2956697486":573,"2956697487":573,"2956698971":573,"2956698972":573,"2956698973":573,"2956698974":573,"2956702051":573,"2956707601":71,"2956708243":71,"2956709415":71,"2956710378":71,"2964565818":371,"2964569717":371,"2964569718":371,"2964569719":371,"2964569720":371,"2964569721":371,"2964571375":371,"2964571376":371,"2964571377":371,"2964571378":371,"2964571379":371,"2964572858":371,"2964572859":371,"2964572860":371,"2964572861":371,"2964572862":371,"2980244309":183,"3025659077":483,"3025659078":483,"3025659079":483,"3025659080":483,"3025659081":483,"3025659082":483,"3025659083":483,"3025711207":483,"3025711208":483,"3025711209":483,"3025711210":483,"3025711211":483,"3025711212":483,"3025711213":483,"3025718032":483,"3025718033":483,"3025718034":483,"3025718035":483,"3025718036":483,"3025718037":483,"3025718038":483,"3025775671":221,"3025775672":221,"3025775673":221,"3025775675":221,"3025775676":221,"3025775677":221,"3025775678":221,"3025778634":221,"3025778635":221,"3025786937":221,"3025786938":221,"3025786939":221,"3025786940":221,"3025786941":221,"3025786942":221,"3025786943":221,"3025790669":221,"3025790670":221,"3025790671":221,"3025790672":221,"3025790673":221,"3025790674":221,"3025790675":221,"3025833106":731,"3025833107":731,"3025833108":731,"3025833109":731,"3025833110":731,"3025833111":731,"3025833112":731,"3025838306":731,"3025838307":731,"3025838308":731,"3025838309":731,"3025838310":731,"3025838311":731,"3025838312":731,"3026106631":521,"3026106632":521,"3026106633":521,"3026106634":521,"3026106635":521,"3026108538":521,"3026108539":521,"3026108540":521,"3026108541":521,"3026108542":521,"3026109991":521,"3026109992":521,"3026109993":521,"3026109994":521,"3026109995":521,"3026119175":521,"3026119176":521,"3026119177":521,"3026119178":521,"3026119179":521,"3026130098":483,"3026130099":483,"3026130100":483,"3026130101":483,"3026130102":483,"3026131856":483,"3026133124":483,"3026134442":483,"3026134443":483,"3026134444":483,"3026134445":483,"3026134446":483,"3026692950":258,"3026692951":258,"3026692952":258,"3026692953":258,"3026692954":258,"3026692955":258,"3026692956":258,"3026693194":258,"3026693195":258,"3026693196":258,"3026693197":258,"3026693198":258,"3026693199":258,"3026693200":258,"3026693606":258,"3026693607":258,"3026693608":258,"3026693609":258,"3026693610":258,"3026693611":258,"3026693612":258,"3026700386":198,"3026700387":198,"3026700838":198,"3026700839":198,"3026705627":468,"3026705628":468,"3026705629":468,"3026705630":468,"3026705631":468,"3026706903":468,"3026706904":468,"3026706905":468,"3026706906":468,"3026706907":468,"3026709970":468,"3026712082":468,"3026725092":513,"3026725093":513,"3026725094":513,"3026725095":513,"3026725097":513,"3026725098":513,"3026725099":513,"3026728655":513,"3026728656":513,"3026728657":513,"3026728658":513,"3026728659":513,"3026728660":513,"3026728661":513,"3026730720":513,"3026730721":513,"3026730722":513,"3026730723":513,"3026730724":513,"3026730725":513,"3026730726":513,"3027953269":877,"3027954920":877,"3027955570":877,"3027971495":513,"3027971496":513,"3027971497":513,"3027973735":513,"3027976080":513,"3027976081":513,"3027976082":513,"3027976083":513,"3027976084":513,"3027976085":513,"3027976086":513,"3027980019":513,"3027980021":513,"3027980022":513,"3027980023":513,"3027980024":513,"3027980025":513,"3027980026":513,"3040118312":521,"3040118313":521,"3040130687":296,"3040130688":296,"3040130689":296,"3040130690":296,"3040130691":296,"3040134025":296,"3040134026":296,"3040134027":296,"3040134028":296,"3040134029":296,"3040137811":296,"3040137812":296,"3040137813":296,"3040137814":296,"3040137815":296,"3040140679":296,"3040140680":296,"3040140681":296,"3040140682":296,"3040140683":296,"3040154355":243,"3040154356":243,"3040154357":243,"3040154358":243,"3040154359":243,"3040154360":243,"3040154361":243,"3040158482":243,"3040162908":588,"3040162909":588,"3040162910":588,"3040162911":588,"3040162912":588,"3040164565":588,"3040164566":588,"3040164567":588,"3040164568":588,"3040164569":588,"3043179723":570,"3043237517":371,"3043237518":371,"3043237519":371,"3045216949":333,"3045216950":333,"3045218343":333,"3045218344":333,"3045220992":333,"3045220993":333,"3045222858":333,"3045222859":333,"3045229100":333,"3045235360":333,"3049939198":333,"3049939199":333,"3049939200":333,"3049939201":333,"3049939202":333,"3049939203":333,"3049939204":333,"3049944339":333,"3049944340":333,"3049944341":333,"3049944342":333,"3049944343":333,"3049944344":333,"3049944345":333,"3049960782":333,"3049960783":333,"3049960784":333,"3049960785":333,"3049960786":333,"3049960787":333,"3049960788":333,"3049969001":333,"3049969005":333,"3049969007":333,"3049969009":333,"3049969011":333,"3049969013":333,"3049969015":333,"3049976311":333,"3049976312":333,"3049976313":333,"3049976314":333,"3049976315":333,"3049976316":333,"3049976317":333,"3050307050":333,"3050307051":333,"3050307052":333,"3050307053":333,"3050307054":333,"3050307055":333,"3050307056":333,"3050313038":333,"3050313039":333,"3050313040":333,"3050313041":333,"3050313043":333,"3050313044":333,"3050313045":333,"3050318107":333,"3050318109":333,"3050318110":333,"3050318111":333,"3050318112":333,"3050318113":333,"3050318114":333,"3050325070":333,"3050325071":333,"3050325072":333,"3050325073":333,"3050325074":375,"3050325075":375,"3050325076":375,"3050355765":371,"3050355766":371,"3050355767":371,"3050355768":371,"3050355769":371,"3050355770":371,"3050355771":371,"3050360587":371,"3050360588":371,"3050360589":371,"3050360590":371,"3050360591":371,"3050360592":371,"3050360593":371,"3050364551":371,"3050364553":371,"3050364554":371,"3050364555":371,"3050364556":371,"3050364557":371,"3050364558":371,"3057183966":483,"3057183967":483,"3057183968":483,"3057186827":483,"3057189186":483,"3057189187":483,"3057189188":483,"3057189189":483,"3057189190":483,"3057189191":483,"3057189192":483,"3069130356":333,"3069130357":333,"3069130358":333,"3069130359":333,"3069130360":333,"3069130361":333,"3069130362":333,"3069137365":333,"3069137366":333,"3069137367":333,"3069137368":333,"3069137369":333,"3069137370":333,"3069137371":333,"3069142306":333,"3069149260":333,"3069149261":333,"3069149263":333,"3069149264":333,"3069149265":333,"3069149266":333,"3069149267":333,"3069200067":296,"3069200068":296,"3069200069":296,"3069215804":296,"3069215805":296,"3069215807":296,"3069304555":446,"3069304556":446,"3069304557":446,"3069304558":446,"3069304559":446,"3069304560":446,"3069304561":446,"3069306160":446,"3069306161":446,"3069306162":446,"3069306163":446,"3069306164":446,"3069306165":446,"3069306166":446,"3069307871":446,"3069307872":446,"3069319377":483,"3069321049":483,"3069321050":483,"3069321051":483,"3069321052":483,"3069321053":483,"3069321054":483,"3069321055":483,"3069323085":483,"3069323086":483,"3069323087":483,"3069323088":483,"3069323089":483,"3069323090":483,"3069323091":483,"3069324418":483,"3069324419":483,"3069324420":483,"3069324421":483,"3069324422":483,"3069324423":483,"3069386132":1342,"3069389308":1342,"3135131736":1042,"3202615661":183,"3206691906":183};
function mbPrice_(art, sitePrice) {
  const a = String(art || '').trim();
  let rrp = p1ByArt_()[a];
  if (!(rrp > 0)) rrp = parseFloat(sitePrice);
  const cab = MB_CAB_[a];
  if (cab > 0) return Math.max(Math.round(cab * 2), Math.round(rrp));
  return Math.round(rrp * 1.5);
}

// 04.11.2026 рішення Дмитра: MagBaby дешевше 400 грн на маркетплейсі (закупка ×2) — плюс комісія майданчика
function mbCom_(p, pct) { return p > 0 && p < 400 ? Math.round(p * (1 + pct / 100)) : p; }
function mpPrice_(art, name, sitePrice, pct) {
  { const a_ = String(art || '').trim(), sp_ = parseFloat(sitePrice); if ((drIsArt_(a_) || /^(TV|TALVI)-/.test(a_)) && sp_ > 0 && sp_ < 400) return Math.round(sp_ * (1 + pct / 100)); } // 04.11.2026 рішення Дмитра: Talvi і ДоРечі дешевше 400 грн (MagBaby — mbCom_) — ціна сайту + комісія майданчика (Prom 18, Kasta 22, Rozetka 24,5, Епіцентр 15)
  if (drIsArt_(art) && DR_OWN_.indexOf(String(art).trim()) >= 0) return DR_OWN_PRICE_[String(art).trim()] || Math.round(parseFloat(sitePrice)); // 31.10.2026: ДоРечі з власного складу (рах. №754) — РРЦ без комісії на всіх маркетплейсах (рішення Дмитра)
  if (drIsArt_(art)) return Math.round(parseFloat(sitePrice)); // 01.11.2026 рішення Дмитра: ДоРечі на всіх сайтах = дроп-ціна ×2 (ціна сайту), без надбавки на комісію
  if (/^(TV|TALVI)-/.test(String(art || '').trim())) return Math.round(parseFloat(sitePrice)); // 04.11.2026: і Talvi-дроп — ціна сайту (дроп ×2), як на інших маркетплейсах // Talvi 18.10.2026: ціна сайту (як у взуття)
if (/^4820000\d{6}$/.test(String(art || '').trim())) return Math.round(parseFloat(sitePrice)); // Timi Tex 22.10.2026: ціна сайту на всіх маркетплейсах (рішення Дмитра)
  { const a0 = String(art || '').trim(); if (p1ByArt_()[a0] > 0 || MB_CAB_[a0] > 0) return mbCom_(mbPrice_(a0, sitePrice), pct); } // 02.11.2026: MagBaby = закупка ×2 (і для Епіцентру)
  let p1 = p1ByArt_()[String(art || '').trim()];
  if (!(p1 > 0)) p1 = promBase_(name, sitePrice);
  return p1 > 0 ? Math.round(p1 * (1 + pct / 100)) : null;
}

function mpPrices_(xml, pct, stats) {
  return xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const art = (body.match(/<vendorCode>(?:<!\[CDATA\[)?\s*([^<\]\s]+)/) || [])[1] || '';
    const nm = (body.match(/<name_ua>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name_ua>/) ||
                body.match(/<name>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/name>/) || [])[1] || '';
    const sp = (body.match(/<price>([\d.]+)<\/price>/) || [])[1];
    if (!sp) return all;
    const fromFeed = p1ByArt_()[art] > 0;
    let np = mpPrice_(art, nm, sp, pct);
    if (/<vendor>(?:<!\[CDATA\[)?\s*MagBaby/.test(body)) np = mbCom_(mbPrice_(art, sp), pct); // 02.11.2026: MagBaby = закупка × 2
    // 31.10.2026: MagBaby, якого немає у фіді MagBaby (немає ціни 1), — дешевше 500 грн іде з повною комісією від ціни сайту (раніше йшов по ціні сайту без комісії)
    if (!np && /<vendor>\s*MagBaby\s*<\/vendor>/.test(body) && parseFloat(sp) < TOY_CHEAP_LT) np = Math.round(parseFloat(sp) * (1 + pct / 100));
    if (stats) { stats.total++; if (fromFeed) stats.feed++; else if (np) stats.table++; else stats.none.push(art + ' ' + nm.slice(0, 40)); }
    if (!np) return all;
    body = body
      .replace(/<oldprice>([\d.]+)<\/oldprice>/, function (_, o) { return '<oldprice>' + Math.round(parseFloat(o) * np / parseFloat(sp)) + '</oldprice>'; })
      .replace(/<price>[\d.]+<\/price>/, '<price>' + np + '</price>');
    return '<offer' + attrs + '>' + body + '</offer>';
  });
}

// f=mpreport — покриття цінами 1: скільки з фіду MagBaby, скільки з таблиці, скільки без ціни 1
function mpReport_() {
  const xml = UrlFetchApp.fetch(SRC, { muteHttpExceptions: true }).getContentText('UTF-8');
  const st = { total: 0, feed: 0, table: 0, none: [] , mbFeedItems: Object.keys(p1ByArt_()).length };
  mpPrices_(xml, 18, st);
  st.noneCount = st.none.length; st.none = st.none.slice(0, 40);
  return JSON.stringify(st, null, 1);
}
// ===== ДОРЕЧІ → САЙТ letimo.com.ua через Horoshop API (09.10.2026) =====
// Документація: horoshop.notion.site/api-doc — auth (токен 600 с), catalog/export (до 500, фільтр article), catalog/import.
// Логін/пароль API-адміна — у Властивостях скрипту HS_LOGIN / HS_PASSWORD (Horoshop: Налаштування → Адміни).
// hsTestOne()  — створити на сайті 1 модель ДоРечі (усі її розміри) для перевірки.
// hsSyncAll()  — створити відсутні товари ДоРечі й оновити ціну (РРЦ) та наявність у вже створених.
// hsSetupTrigger() — запускати hsSyncAll кожні 3 години.
// Працює ТІЛЬКИ з артикулами DR-…; товари MagBaby та інших постачальників не зачіпаються.
const HS_API = 'https://letimo.com.ua/api/';
let HS_TOKEN_ = null, HS_TOKEN_AT_ = 0;
function hsCall_(fn, body) {
  const r = UrlFetchApp.fetch(HS_API + fn + '/', { method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true });
  try { return JSON.parse(r.getContentText('UTF-8')); }
  catch (e) { throw new Error('Horoshop API ' + fn + ' HTTP ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 200)); }
}
function hsToken_() {
  if (HS_TOKEN_ && Date.now() - HS_TOKEN_AT_ < 480000) return HS_TOKEN_;
  const pr = PropertiesService.getScriptProperties();
  const login = pr.getProperty('HS_LOGIN'), password = pr.getProperty('HS_PASSWORD');
  if (!login || !password) throw new Error('Немає HS_LOGIN / HS_PASSWORD у властивостях скрипту');
  const j = hsCall_('auth', { login: login, password: password });
  if (j.status !== 'OK') throw new Error('Horoshop auth: ' + j.status + ' ' + JSON.stringify(j.response || {}).slice(0, 200));
  HS_TOKEN_ = j.response.token; HS_TOKEN_AT_ = Date.now();
  return HS_TOKEN_;
}
// Які з артикулів уже є на сайті
function hsExisting_(arts) {
  const have = {};
  for (let i = 0; i < arts.length; i += 100) {
    const j = hsCall_('catalog/export', { token: hsToken_(), article: arts.slice(i, i + 100), limit: 500 });
    if (j.status === 'OK') (j.response.products || []).forEach(function (p) { if (p.article) have[p.article] = 1; });
    else if (j.status !== 'EMPTY') throw new Error('Horoshop export: ' + j.status + ' ' + JSON.stringify(j.response || {}).slice(0, 200));
  }
  return have;
}
function hsUnesc_(s) { return String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim(); }
function hsTag_(o, t) { const m = o.match(new RegExp('<' + t + '>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?</' + t + '>')); return m ? m[1] : ''; }
// Товари ДоРечі у форматі API (дані — ті самі, що йдуть на маркетплейси: drOffers_)
function hsDrItems_() {
  const dr = drOffers_(), out = [];
  dr.offers.forEach(function (o) {
    const art = hsUnesc_(hsTag_(o, 'vendorCode'));
    const d = dr.byArt[art] || {};
    const size = (o.match(/<param name="Розмір">([^<]*)<\/param>/) || [])[1] || '';
    out.push({
      art: art, g: (o.match(/group_id="(\d+)"/) || [])[1] || art, cat: hsTag_(o, 'categoryId'),
      name: d.name || hsTag_(o, 'name_ua'), size: hsUnesc_(size), color: d.color || '',
      price: (DR_OWN_PRICE_[art] || Number(hsTag_(o, 'price'))), qty: Number(hsTag_(o, 'quantity_in_stock')) || 0,
      html: hsTag_(o, 'description_ua'), pics: (o.match(/<picture>[^<]*<\/picture>/g) || []).map(function (x) { return hsUnesc_(x.replace(/<\/?picture>/g, '')); })
    });
  });
  return out;
}
// maxNew — скільки нових моделей створити за запуск (1 — тест; без аргументу — усі)
function hsSyncDorechi(maxNew) {
  const items = hsDrItems_();
  const first = {};
  items.forEach(function (it) { if (!first[it.g]) first[it.g] = it.art; });
  const have = hsExisting_(items.map(function (it) { return it.art; }));
  const limit = (maxNew === undefined || maxNew === null || maxNew === '') ? 1e9 : Number(maxNew);
  const newGroups = {}, upd = [], add = [];
  items.forEach(function (it) {
    const presence = it.qty > 0 ? 'В наявності' : 'Немає в наявності';
    if (have[it.art]) { upd.push({ article: it.art, price: it.price, presence: presence }); return; }
    if (!newGroups[it.g]) { if (Object.keys(newGroups).length >= limit) return; newGroups[it.g] = 1; }
    const p = {
      parent_article: first[it.g], article: it.art, title: it.name, mod_title: it.size || it.name,
      description: it.html, parent: { id: Number(it.cat) }, display_in_showcase: true,
      presence: presence, price: it.price, brand: 'ДоРечі', supplier: { value: 'ДоРечі' },
      images: { override: true, links: it.pics },
      characteristics: { country: { ua: 'Україна', ru: 'Украина' } }
    };
    if (it.color) p.color = it.color;
    add.push(p);
  });
  add.sort(function (x, y) { return (x.article === x.parent_article ? 0 : 1) - (y.article === y.parent_article ? 0 : 1); }); // батьківський товар — першим
  const res = { onSite: Object.keys(have).length, created: 0, updated: 0, errors: [] };
  const send = function (list, kind) {
    for (let i = 0; i < list.length; i += 25) {
      const j = hsCall_('catalog/import', { token: hsToken_(), products: list.slice(i, i + 25) });
      if (j.status !== 'OK' && j.status !== 'WARNING') { res.errors.push(kind + ': ' + j.status + ' ' + JSON.stringify(j.response || {}).slice(0, 200)); continue; }
      ((j.response && j.response.log) || []).forEach(function (l) {
        const bad = (l.info || []).filter(function (x) { return [0, 3, 4, 9, 15, 22, 28].indexOf(Number(x.code)) < 0; });
        if (bad.length) res.errors.push(l.article + ': ' + bad.map(function (x) { return x.code + ' ' + x.message; }).join('; ').slice(0, 200));
        else res[kind]++;
      });
    }
  };
  send(add, 'created');
  send(upd, 'updated');
  res.errors = res.errors.slice(0, 30);
  Logger.log(JSON.stringify(res));
  return res;
}
function hsTestOne() { return hsSyncDorechi(1); }
function hsSyncAll() { return hsSyncDorechi(); }
function hsSetupTrigger() {
  ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'hsSyncAll'; }).forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('hsSyncAll').timeBased().everyHours(3).create();
}
// Маркетплейси: товари ДоРечі беремо напряму від постачальника (drOffers_), а їхні копії з фіду сайту (артикули DR-…)
// прибираємо, щоб не було дублів. Ця версія drAdd_ замінює попередню (у скрипті діє останнє оголошення функції).
function drAdd_(xml) {
  xml = xml.replace(/<offer\b[\s\S]*?<\/offer>\s*/g, function (o) { return /<vendorCode>(?:<!\[CDATA\[)?\s*DR-/.test(o) ? '' : o; });
  try { return xml.replace('</offers>', drOffers_().offers.join('\n') + '\n</offers>'); }
  catch (e) { Logger.log('ДоРечі пропущено: ' + e.message); return xml; }
}
// ===== /ДОРЕЧІ → САЙТ =====
// ===== ДОРЕЧІ → файл для ручного імпорту на сайт (09.10.2026) =====
// f=dorechicsv -> CSV у форматі імпорту Horoshop (help.horoshop.ua «Підготовка файлів для імпорту товарів»):
// Артикул, Батьківський артикул, Назва, Назва модифікації, Розділ, Розмір, Ціна, Валюта, Наявність, Відображати, Фото, Опис.
// Імпорт: Товари → Імпорт → посилання → поле «Постачальник» = ДоРечі (оновлюються лише товари ДоРечі).
const DR_SITE_PATH = {
  '1135': 'Одяг/Комбінезони', '1091': 'Одяг/Верхній одяг',
  '1128': 'Головні убори та аксесуари/Головні убори', '1103': 'Головні убори та аксесуари/Пінетки',
  '1088': 'Головні убори та аксесуари/Рукавички', '1122': 'Головні убори та аксесуари/Шарфи та манішки',
  '1131': 'Виписка та хрещення/Конверти для новонароджених', '1108': 'Текстиль/Пледи та покривала',
  '1140': 'Прогулянка та іграшки/Аксесуари для колясок'
};
function drCsvCell_(v) { const s = String(v === undefined || v === null ? '' : v); return /[",\n\r;]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function buildDorechiCsv_(maxGroups) { // maxGroups — лише перші N моделей (для тестового імпорту), без нього — усі
  let items = hsDrItems_();
  const first = {}, order = [];
  items.forEach(function (it) { if (!first[it.g]) { first[it.g] = it.art; order.push(it.g); } });
  if (maxGroups) { const keep = {}; order.slice(0, Number(maxGroups)).forEach(function (g) { keep[g] = 1; }); items = items.filter(function (it) { return keep[it.g]; }); }
  // Заголовки = назви полів у вікні імпорту Horoshop (так колонки зіставляються автоматично). «Фото» Horoshop завжди просить зіставити вручну.
  const head = ['Артикул', 'Родительский артикул', 'Название (UA)', 'Название модификации (UA)', 'Раздел', 'Розмір', 'Цена', 'Валюта', 'Наличие', 'Отображать', 'Бренд', 'Выгружать на маркетплейсы', 'Фото', 'Описание товара (UA)'];
  const rows = [head.join(',')];
  items.forEach(function (it) {
    const path = DR_SITE_PATH[it.cat];
    if (!path) return;
    const sz = it.size ? (/^\d{2,3}([\/\-]\d{2,3})?$/.test(it.size) ? it.size + ' см' : it.size) : '';
    rows.push([it.art, first[it.g], it.name, it.name + (sz ? ' ' + sz : ''), path, it.size, (DR_OWN_PRICE_[it.art] || it.price), /* 31.10.2026: власний склад ×2 */ 'UAH',
      it.qty > 0 ? 'В наявності' : 'Немає в наявності', 'Да', 'ДоРечі', 'Google Feed for Merchant Center', it.pics.join(';'), it.html].map(drCsvCell_).join(','));
  });
  return rows.join('\r\n');
}
// ===== /ДОРЕЧІ → файл для імпорту =====

// ===== PROM: російська версія, пошукові запити, характеристики (09.10.2026) =====
// promEnrich_(xml) — лише для фіду Prom (prom.xml і exec без параметра):
//  1) <name>/<description> російською — з кешу перекладів ru-cache.json (GitHub, той самий репозиторій фідів);
//     переклади робить translateRu() (Google Translate через LanguageApp) — запускається тригером щогодини,
//     перекладає лише нове; поки перекладу немає, лишається як було (українською).
//  2) <keywords>/<keywords_ua> — пошукові запити за категорією + тип/модель/колір товару (до 1024 символів, вимога Prom).
//  3) Характеристики Prom з фіду MagBaby (box.magbaby.ua 15.xml — їхнє вивантаження для Prom): Стать, Вид виробу,
//     Тип тканини, Сезон, Фасон рукава, Застібка тощо. Зіставлення за назвою моделі + розміром. Наші параметри не перезаписуються.
//     Усім товарам без «Стан» додається «Стан: Новий».
const MB_PROM_XML = 'https://box.magbaby.ua/media/export/15.xml';
const PR_PARAMS = ['Стать', 'Вид виробу', 'Тип тканини', 'Сезон', 'Фасон рукава', 'Довжина рукава', 'Застібка', 'Капюшон',
  'Наявність капюшона', 'Візерунки і принти', 'Матеріал верху', 'Матеріал підкладки', 'Матеріал виготовлення', 'Вид утеплювача',
  'Наповнювач', 'Хутряна обробка', 'Знімне хутро', 'Водовідштовхувальні властивості', 'Водовідштовхувальне просочення',
  'Непромокаєма', 'Зовнішні шви', 'Наявність кишень', 'Наявність пояса', 'Оздоблення та прикраси', 'Тип пелюшки', 'Тип трусів',
  'Вид пінеток', 'Кількість в наборі', 'Кількість предметів', 'Можливість трансформації в ковдру', 'Ортопедичні властивості',
  'Довжина халата', 'Призначення'];
const PR_RU_FILE = 'ru-cache.json';

function prUn_(s) { return String(s || '').replace(/<!\[CDATA\[|\]\]>/g, '').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim(); }
function prTag_(o, t) { const m = o.match(new RegExp('<' + t + '>([\\s\\S]*?)</' + t + '>')); return m ? prUn_(m[1]) : ''; }
function prCdata_(s) { return '<![CDATA[' + String(s).replace(/\]\]>/g, ']]&gt;') + ']]>'; }

// Ключ зіставлення з MagBaby: слова назви без розміру + перший розмірний код (як у файлі «Нові ціни» 09.10)
function prKey_(name) {
  let s = String(name).toLowerCase().replace(/ё/g, 'е').replace(/прорезувач/g, 'прорізувач').replace(/[«»"'`’ʼ“”„]/g, '');
  s = s.replace(/,\s*(вязання|шапка|для дівчаток|для хлопчиків|кнопки|демі|трусики)(?=[,\s]|$)/g, '');
  s = s.replace(/\s*-\s*/g, '-').replace(/(\d)\s*(кг|см|міс|рок)\.?/g, '$1 $2').replace(/\.(?=\s|\)|$)/g, '').replace(/[,()]/g, ' ').replace(/\s+/g, ' ').trim();
  const num = (s.match(/(^|[^\d])(\d{1,3}(?:[-\/]\d{1,3})?)(?!\d)/) || [])[2] || '';
  let w = s.replace(/\d{1,3}(?:[-\/]\d{1,3})?/g, ' ');
  for (let i = 0; i < 2; i++) w = (' ' + w + ' ').replace(/\s(міс|роки|років|рік|рок|кг|см|до|старше|від|х)(?=\s)/g, ' ');
  return { w: w.replace(/\s+/g, ' ').trim(), s: num };
}

let PR_MB_ = null;
function prMbIndex_() {
  if (PR_MB_) return PR_MB_;
  PR_MB_ = {};
  try {
    const r = UrlFetchApp.fetch(MB_PROM_XML, { muteHttpExceptions: true, followRedirects: true });
    if (r.getResponseCode() !== 200) return PR_MB_;
    r.getContentText('UTF-8').replace(/<offer\b[^>]*>([\s\S]*?)<\/offer>/g, function (all, body) {
      const k = prKey_(prTag_(body, 'name'));
      const ps = {};
      body.replace(/<param name="([^"]+)">([^<]*)<\/param>/g, function (a, n, v) { if (PR_PARAMS.indexOf(n) >= 0 && v.trim() && !/[ыэъё]|(ая|ое|ые|ой)(?![а-яіїєґ])/i.test(v)) ps[n] = v.trim(); return a; }); // останнє значення = українське
      if (!PR_MB_[k.w]) PR_MB_[k.w] = {};
      PR_MB_[k.w][k.s] = ps;
      return '';
    });
  } catch (e) { Logger.log('MagBaby 15.xml: ' + e.message); }
  return PR_MB_;
}
function prMbParams_(name) {
  const k = prKey_(name), m = prMbIndex_()[k.w];
  if (!m) return null;
  if (m[k.s]) return m[k.s];
  const any = Object.keys(m)[0];
  return any !== undefined ? m[any] : null;
}

// ---- кеш перекладів (GitHub) ----
function prRuLoad_() {
  try {
    const p = PropertiesService.getScriptProperties();
    const r = UrlFetchApp.fetch('https://api.github.com/repos/' + p.getProperty('GH_REPO') + '/contents/' + PR_RU_FILE + '?ref=' + GH_BRANCH, {
      muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + p.getProperty('GH_TOKEN'), Accept: 'application/vnd.github.raw' } });
    if (r.getResponseCode() === 200) { const c = JSON.parse(r.getContentText('UTF-8')); c.n = c.n || {}; c.d = c.d || {}; return c; }
  } catch (e) { Logger.log('ru-cache: ' + e.message); }
  return { n: {}, d: {} };
}
function prHash_(s) { return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, s, Utilities.Charset.UTF_8)).slice(0, 22); }
const PR_TAIL_RX = /^(.*?)([ ,]+(?:\d{2,3}(?:\s*[-\/]\s*\d{2,3})?(?:\s*см\.?)?\s*(?:\(.*\))?|до \d+ ?см.*|\d+ ?(?:міс|рок).*))$/;
function prSplitName_(n) { const m = String(n).match(PR_TAIL_RX); return m ? [m[1].trim(), m[2]] : [String(n).trim(), '']; }
function prTailRu_(t) { return t.replace(/міс/g, 'мес').replace(/років/g, 'лет').replace(/роки/g, 'года').replace(/рік/g, 'год').replace(/від /g, 'от ').replace(/старше/g, 'старше'); }
function prIsUa_(s) { return /[іїєґІЇЄҐ]/.test(s); }

// Перекладає нові назви (модель без розміру) та описи. Запускати тригером (prSetupRuTrigger) — працює ~4.5 хв за раз.
function translateRu() {
  const t0 = Date.now();
  const cache = prRuLoad_();
  const site = UrlFetchApp.fetch(SRC, { muteHttpExceptions: true }).getContentText('UTF-8');
  let dr = ''; try { dr = drOffers_().offers.join('\n'); } catch (e) {}
  const names = {}, descs = {};
  (site + dr).replace(/<offer\b[^>]*>([\s\S]*?)<\/offer>/g, function (all, body) {
    const n = prTag_(body, 'name_ua') || prTag_(body, 'name');
    const d = prTag_(body, 'description_ua') || prTag_(body, 'description');
    const model = prSplitName_(n)[0];
    if (model && (prIsUa_(model) || n === prTag_(body, 'name')) && !cache.n[model]) names[model] = 1; // 16.10: також коли RU = UA (назви без і/ї/є)
    if (d && (prIsUa_(d.replace(/<[^>]+>/g, '')) || d === prTag_(body, 'description'))) { const h = prHash_(d); if (!cache.d[h]) descs[h] = d; }
    return '';
  });
  let nAdd = 0, dAdd = 0, err = '';
  const nl = Object.keys(names);
  try {
    for (let i = 0; i < nl.length && Date.now() - t0 < 120000; i += 40) {
      const chunk = nl.slice(i, i + 40);
      const out = LanguageApp.translate(chunk.join('\n'), 'uk', 'ru').split('\n');
      if (out.length === chunk.length) chunk.forEach(function (k, j) { if (out[j].trim()) { cache.n[k] = out[j].trim(); nAdd++; } });
      else chunk.forEach(function (k) { const t = LanguageApp.translate(k, 'uk', 'ru'); if (t) { cache.n[k] = t.trim(); nAdd++; } });
    }
    const dl = Object.keys(descs);
    for (let i = 0; i < dl.length && Date.now() - t0 < 270000; i++) {
      const t = LanguageApp.translate(descs[dl[i]], 'uk', 'ru', { contentType: 'html' });
      if (t) { cache.d[dl[i]] = t; dAdd++; }
    }
  } catch (e) { err = e.message; }
  if (nAdd || dAdd) ghPublish_({ 'ru-cache.json': JSON.stringify(cache) }, 'ru-cache +' + nAdd + ' names +' + dAdd + ' desc');
  const left = { names: nl.length - nAdd, descs: Object.keys(descs).length - dAdd };
  const msg = 'translateRu: +' + nAdd + ' назв, +' + dAdd + ' описів; лишилось ' + left.names + ' назв, ' + left.descs + ' описів' + (err ? ' | ERR ' + err : '');
  Logger.log(msg);
  return msg;
}
function prSetupRuTrigger() {
  ScriptApp.getProjectTriggers().filter(function (t) { return t.getHandlerFunction() === 'translateRu'; }).forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('translateRu').timeBased().everyHours(1).create();
}

// ---- пошукові запити ----
const PR_KW = {
  '1088': ['дитячі рукавички, рукавички для дітей, теплі рукавички дитячі, рукавиці дитячі, рукавички для малюка', 'детские перчатки, перчатки для детей, теплые перчатки детские, варежки детские, рукавички для малыша'],
  '1091': ['дитяча куртка, куртка для дитини, дитячий верхній одяг, куртка для малюка, демісезонна куртка дитяча, зимова куртка дитяча', 'детская куртка, куртка для ребенка, детская верхняя одежда, куртка для малыша, демисезонная куртка детская, зимняя куртка детская'],
  '1092': ['дитячий текстиль, текстиль для немовлят, аксесуари для дитячої кімнати', 'детский текстиль, текстиль для новорожденных, аксессуары для детской комнаты'],
  '1094': ['слинявчик дитячий, нагрудник для дитини, слюнявчик для годування, нагрудник для малюка', 'слюнявчик детский, нагрудник для ребенка, слюнявчик для кормления, нагрудник для малыша'],
  '1095': ['накидка для годування, накидка для грудного вигодовування, накидка для мами, накидка для годування груддю', 'накидка для кормления, накидка для грудного вскармливания, накидка для мамы, накидка для кормления грудью'],
  '1096': ['царапки для немовлят, рукавички антицарапки, царапки для новонароджених', 'царапки для новорожденных, рукавички антицарапки, царапки для малыша'],
  '1100': ['дитячі шкарпетки, дитячі колготки, шкарпетки для немовлят, білизна дитяча, трусики дитячі', 'детские носки, детские колготки, носки для новорожденных, белье детское, трусики детские'],
  '1103': ['пінетки для немовлят, пінетки для новонароджених, дитячі пінетки, пінетки теплі, взуття для немовлят', 'пинетки для новорожденных, детские пинетки, пинетки для малыша, теплые пинетки, обувь для новорожденных'],
  '1105': ['пелюшка для немовлят, пелюшка для новонароджених, пелюшка кокон, муслінова пелюшка, пелюшка на блискавці', 'пеленка для новорожденных, пеленка для малыша, пеленка кокон, муслиновая пеленка, пеленка на молнии'],
  '1108': ['дитячий плед, плед для немовляти, плед для новонародженого, покривало дитяче, плед у коляску', 'детский плед, плед для новорожденного, плед для малыша, покрывало детское, плед в коляску'],
  '1109': ['дитячий костюм, костюм для дитини, костюм для малюка, дитячий спортивний костюм, костюм для немовляти', 'детский костюм, костюм для ребенка, костюм для малыша, детский спортивный костюм, костюм для новорожденного'],
  '1110': ['набір для новонародженого, набір в пологовий будинок, набір на виписку, комплект для новонародженого', 'набор для новорожденного, набор в роддом, набор на выписку, комплект для новорожденного'],
  '1112': ['подушка для немовляти, дитяча подушка, подушка для новонародженого', 'подушка для новорожденного, детская подушка, подушка для малыша'],
  '1115': ['повзунки для немовлят, повзунки для новонароджених, дитячі повзунки, штанці для немовляти', 'ползунки для новорожденных, детские ползунки, ползунки для малыша, штанишки для новорожденного'],
  '1116': ['дитячі шорти, шорти для дитини, шорти для малюка, шорти для хлопчика, шорти для дівчинки', 'детские шорты, шорты для ребенка, шорты для малыша, шорты для мальчика, шорты для девочки'],
  '1122': ['дитячий шарф, манішка дитяча, снуд дитячий, шарф для дитини', 'детский шарф, манишка детская, снуд детский, шарф для ребенка'],
  '1124': ['дитяча футболка, лонгслів дитячий, футболка для дитини, сорочка дитяча, гольф дитячий', 'детская футболка, лонгслив детский, футболка для ребенка, рубашка детская, гольф детский'],
  '1126': ['дитячий рушник, рушник з капюшоном, рушник для немовляти, кутик для купання', 'детское полотенце, полотенце с капюшоном, полотенце для новорожденного, уголок для купания'],
  '1127': ['дитячий комплект, комплект для малюка, комплект одягу для дитини, комплект для немовляти', 'детский комплект, комплект для малыша, комплект одежды для ребенка, комплект для новорожденного'],
  '1128': ['дитяча шапка, шапка для немовляти, шапочка для новонародженого, шапка для дитини, панама дитяча', 'детская шапка, шапка для новорожденного, шапочка для малыша, шапка для ребенка, панама детская'],
  '1130': ['боді для немовлят, боді для новонароджених, дитячий боді, пісочник для малюка, боді з довгим рукавом', 'боди для новорожденных, детский боди, боди для малыша, песочник для малыша, боди с длинным рукавом'],
  '1131': ['конверт для новонародженого, конверт на виписку, конверт у коляску, конверт для немовляти, зимовий конверт', 'конверт для новорожденного, конверт на выписку, конверт в коляску, конверт для малыша, зимний конверт'],
  '1133': ['дитячий посуд, посуд для годування, тарілка на присосці, ложка для годування, дитяча тарілка', 'детская посуда, посуда для кормления, тарелка на присоске, ложка для кормления, детская тарелка'],
  '1134': ['термометр для ванни, термометр для води дитячий, градусник для купання', 'термометр для ванной, термометр для воды детский, градусник для купания'],
  '1135': ['дитячий комбінезон, комбінезон для немовляти, комбінезон для новонародженого, зимовий комбінезон дитячий, демісезонний комбінезон', 'детский комбинезон, комбинезон для новорожденного, комбинезон для малыша, зимний комбинезон детский, демисезонный комбинезон'],
  '1136': ['пов\'язка для волосся дитяча, стрічка для волосся, пов\'язка для немовляти, бантик на голову', 'повязка для волос детская, лента для волос, повязка для новорожденной, бантик на голову'],
  '1140': ['аксесуари для коляски, муфта для коляски, матрасик у коляску, козирок для коляски', 'аксессуары для коляски, муфта для коляски, матрасик в коляску, козырек для коляски'],
  '1141': ['дитяча сукня, сукня для дівчинки, сарафан дитячий, плаття для малюка', 'детское платье, платье для девочки, сарафан детский, платье для малышки'],
  '1144': ['пустушка для немовляти, прорізувач для зубів, силіконовий прорізувач, соска пустушка', 'пустышка для новорожденного, прорезыватель для зубов, силиконовый прорезыватель, соска пустышка'],
  '1145': ['набір для хрещення, крижма, одяг для хрещення, рушник для хрещення', 'набор для крещения, крыжма, одежда для крещения, полотенце для крещения'],
  '1147': ['дитячі штани, штани для дитини, лосини дитячі, джинси дитячі, штанці для малюка', 'детские штаны, штаны для ребенка, лосины детские, джинсы детские, штанишки для малыша'],
  '1148': ['дитяча піжама, піжама для дитини, піжама для малюка, піжама бавовняна дитяча', 'детская пижама, пижама для ребенка, пижама для малыша, хлопковая пижама детская'],
  '1150': ['дитяча кофта, светр дитячий, жилет дитячий, кофта для малюка, худі дитяче', 'детская кофта, свитер детский, жилет детский, кофта для малыша, худи детское'],
  '1155': ['одяг для мами, халат для мами, одяг для годування, халат в пологовий будинок', 'одежда для мамы, халат для мамы, одежда для кормления, халат в роддом'],
  '1163': ['чоловічок для немовляти, чоловічок для новонародженого, сліп дитячий, чоловічок бавовняний, комбінезон-чоловічок', 'человечек для новорожденного, слип детский, человечек для малыша, хлопковый человечек, комбинезон-человечек']
};
function prKeywordsOld_(cat, nameUa, nameRu, color) {
  const kw = PR_KW[cat] || ['дитячий одяг, одяг для малюка', 'детская одежда, одежда для малыша'];
  const modelUa = prSplitName_(nameUa)[0].replace(/["«»“”„]/g, '').toLowerCase();
  const typeUa = modelUa.split(',')[0].trim();
  const ua = [typeUa, modelUa.split(',')[0].replace(/\s+\S+$/, '').trim(), kw[0]];
  if (color) ua.push(typeUa.split(' ').slice(0, 2).join(' ') + ' ' + color.toLowerCase());
  const ru = [kw[1]];
  if (nameRu) { const m = prSplitName_(nameRu)[0].replace(/["«»“”„]/g, '').toLowerCase(); ru.unshift(m.split(',')[0].trim()); }
  const uniq = function (a) {
    const seen = {}, out = []; let len = 0;
    a.join(', ').split(/\s*,\s*/).forEach(function (x) {
      x = x.trim();
      if (!x || x.length < 3 || seen[x] || len + x.length + 2 > 1000) return;
      seen[x] = 1; out.push(x); len += x.length + 2;
    });
    return out.join(', ');
  };
  return { ua: uniq(ua), ru: uniq(ru) };
}

// 17.10.2026: v2 пошукових запитів для Prom — лише фрази, що відповідають товару (правила Prom: «повністю відповідати змісту позиції»)
const PR_KW_V2 = true;
const PR_KW_ADJ = /^(дитяч|детск|зимов|зимн|демісезон|демисезон|літн|летн|тепл|в'язан|вязан|утеплен|бавовнян|хлопков|трикотаж|новорічн|новогодн|святков|праздничн|нарядн|ошатн|легк|махров|флісов|флисов|велюров|вельвет|джинсов|спортивн|домашн)/;
function prKwRoot_(type) {
  const ws = String(type).toLowerCase().replace(/["«»“”„]/g, '').split(/[\s,]+/).filter(Boolean);
  let w = ws.find(function (x) { return !PR_KW_ADJ.test(x); }) || ws[0] || '';
  w = w.split('-')[0];
  return w.length > 5 ? w.slice(0, -2) : w;
}
function prKwConflict_(ph, t, season) {
  const p = ph.toLowerCase();
  if (/майк|без рукав|коротк\S* рукав|футболк|сарафан/.test(t) && /довг\S* рукав|длинн\S* рукав/.test(p)) return true;
  if (/довг\S* рукав|длинн\S* рукав|лонгсл/.test(t) && /коротк\S* рукав/.test(p)) return true;
  if (season === 'Зима' && /демісезон|демисезон|літн|летн/.test(p)) return true;
  if (season === 'Весна/Осінь' && /зимов|зимн|літн|летн/.test(p)) return true;
  if (season === 'Літо' && /зимов|зимн|демісезон|демисезон|утепл/.test(p)) return true;
  if (season !== 'Зима' && season !== 'Весна/Осінь' && season !== 'Літо' && /зимов|зимн|демісезон|демисезон|літн|летн/.test(p)) return true;
  const MAT = [/бавовн|хлопк/, /велюр/, /фліс|флис/, /в'язан|вязан/, /муслін|муслин/, /трикотаж/];
  const own = MAT.filter(function (r) { return r.test(t); });
  if (own.length && MAT.some(function (r) { return own.indexOf(r) < 0 && r.test(p); })) return true;
  return false;
}
function prKeywords_(cat, nameUa, nameRu, color) {
  if (!PR_KW_V2) return prKeywordsOld_(cat, nameUa, nameRu, color);
  const kw = PR_KW[cat] || ['дитячий одяг, одяг для малюка', 'детская одежда, одежда для малыша'];
  const modelUa = prSplitName_(nameUa)[0].replace(/["«»“”„]/g, '').toLowerCase();
  const typeUa = modelUa.split(',')[0].trim();
  const season = pfSeason_(modelUa);
  const modelRu = nameRu ? prSplitName_(nameRu)[0].replace(/["«»“”„]/g, '').toLowerCase() : '';
  const typeRu = modelRu.split(',')[0].trim();
  const pick = function (tpl, root, t) {
    const all = String(tpl).split(/\s*,\s*/).filter(Boolean).filter(function (p) { return !prKwConflict_(p, t, season); });
    const ok = root ? all.filter(function (p) { return p.toLowerCase().indexOf(root) >= 0; }) : all;
    return ok.length ? ok : all.slice(0, 2);
  };
  const baseOf = function (raw) { const b = String(raw).split(',')[0].replace(/["«“„][^"»”“]*["»”“]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase(); const w = b.split(' '); return w.length > 5 ? w.slice(0, 4).join(' ') : b; };
  const ua = [typeUa, baseOf(prSplitName_(nameUa)[0])].concat(pick(kw[0], prKwRoot_(typeUa), modelUa));
  if (color) ua.push(baseOf(prSplitName_(nameUa)[0]) + ' ' + color.toLowerCase());
  const ru = (typeRu ? [typeRu, baseOf(prSplitName_(nameRu)[0])] : []).concat(pick(kw[1], prKwRoot_(typeRu), modelRu || modelUa));
  const colRu = (modelRu.split(',')[1] || '').replace(/\s*\d.*$/, '').replace(/[.\s]+$/, '').trim();
  if (typeRu && colRu) ru.push(baseOf(prSplitName_(nameRu)[0]) + ' ' + colRu);
  const uniq = function (a) {
    const seen = {}, out = [];
    a.forEach(function (x) {
      x = String(x).trim();
      if (!x || x.length < 3 || seen[x] || x.split(/\s+/).length > 5 || out.length >= 7) return;
      seen[x] = 1; out.push(x);
    });
    return out.join(', ');
  };
  return { ua: uniq(ua), ru: uniq(ru) };
}

function testKw() {
  MP_PCT_ = MP_MARKUP.prom;
  const x = promEnrich_(buildFeed_());
  const seen = {}, out = [];
  x.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, a, b) {
    const cat = (b.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1] || '';
    if (seen[cat] || out.length >= 12) return all;
    seen[cat] = 1;
    const nUa = prTag_(b, 'name_ua'), nRu = prTag_(b, 'name');
    const color = (b.match(/<param name="Відтінок">([^<]*)<\/param>/) || b.match(/<param name="Колір">([^<]*)<\/param>/) || [])[1] || '';
    const o = prKeywordsOld_(cat, nUa, nRu, prUn_(color));
    out.push('### ' + nUa + '\nБУЛО UA: ' + o.ua + '\nСТАЛО UA: ' + prTag_(b, 'keywords_ua') + '\nБУЛО RU: ' + o.ru + '\nСТАЛО RU: ' + prTag_(b, 'keywords'));
    return all;
  });
  let n = 0, sUa = 0, sRu = 0, low = 0; const lows = [];
  x.replace(/<offer\b[^>]*>([\s\S]*?)<\/offer>/g, function (all, b) { const ua = (prTag_(b, 'keywords_ua') || '').split(',').filter(String), ru = (prTag_(b, 'keywords') || '').split(',').filter(String); n++; sUa += ua.length; sRu += ru.length; if (ua.length < 3 || ru.length < 3) { low++; if (lows.length < 8) lows.push(prTag_(b, 'name_ua') + ' => ' + ua.length + '/' + ru.length); } return all; });
  Logger.log('STATS offers ' + n + ' avgUA ' + (sUa / n).toFixed(1) + ' avgRU ' + (sRu / n).toFixed(1) + ' low(<3) ' + low + '\n' + lows.join('\n'));
}

// ---- головне ----
function promEnrich_(xml) {
  const cache = prRuLoad_();
  const st = { ruName: 0, ruDesc: 0, kw: 0, params: 0, matched: 0 };
  const out = xml.replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const nameUa = prTag_(body, 'name_ua') || prTag_(body, 'name');
    const descUa = prTag_(body, 'description_ua');
    const cat = (body.match(/<categoryId>(\d+)<\/categoryId>/) || [])[1] || '';
    let nameRu = '';
    // 1) російська назва й опис
    if (prIsUa_(prTag_(body, 'name')) || prTag_(body, 'name') === nameUa) {
      const sp = prSplitName_(nameUa), m = cache.n[sp[0]];
      if (m) { nameRu = m + prTailRu_(sp[1]); body = body.replace(/<name>[\s\S]*?<\/name>/, '<name>' + prCdata_(nameRu) + '</name>'); st.ruName++; }
    } else nameRu = prTag_(body, 'name');
    const dRu = prTag_(body, 'description');
    if (descUa && (prIsUa_(dRu.replace(/<[^>]+>/g, '')) || dRu === descUa)) {
      const t = cache.d[prHash_(descUa)];
      if (t) { body = body.replace(/<description>[\s\S]*?<\/description>/, '<description>' + prCdata_(t) + '</description>'); st.ruDesc++; }
    }
    // 2) пошукові запити
    let add = '';
    if (body.indexOf('<keywords>') < 0) {
      const color = (body.match(/<param name="Відтінок">([^<]*)<\/param>/) || body.match(/<param name="Колір">([^<]*)<\/param>/) || [])[1] || '';
      const k = prKeywords_(cat, nameUa, nameRu, prUn_(color));
      add += '<keywords>' + xmlEsc_(k.ru) + '</keywords>\n<keywords_ua>' + xmlEsc_(k.ua) + '</keywords_ua>\n';
      st.kw++;
    }
    // 3) характеристики
    if (/<vendor>MagBaby<\/vendor>/.test(body)) {
      const ps = prMbParams_(nameUa);
      if (ps) {
        st.matched++;
        Object.keys(ps).forEach(function (n) {
          if (body.indexOf('<param name="' + n + '"') < 0 && add.indexOf('<param name="' + n + '"') < 0) { add += '<param name="' + n + '">' + xmlEsc_(ps[n]) + '</param>\n'; st.params++; }
        });
      }
    }
    if (body.indexOf('<param name="Стан"') < 0 && add.indexOf('<param name="Стан"') < 0) add += '<param name="Стан">Новий</param>\n';
    return '<offer' + attrs + '>' + body + add + '</offer>';
  });
  Logger.log('promEnrich: ' + JSON.stringify(st));
  PR_STATS_ = st;
  return out;
}
let PR_STATS_ = null;
function testPromEnrich() {
  MP_PCT_ = MP_MARKUP.prom;
  const x = promEnrich_(buildFeed_());
  const o = (x.match(/<offer\b[\s\S]*?<\/offer>/g) || []);
  const one = o.filter(function (s) { return /<vendor>MagBaby/.test(s); })[0] || '';
  Logger.log(JSON.stringify(PR_STATS_) + ' offers=' + o.length);
  Logger.log(one.replace(/<description(_ua)?>[\s\S]*?<\/description(_ua)?>/g, '[d]').slice(0, 3000));
}
// ===== /PROM =====


// ================== ROZETKA: RU назва/опис + характеристики MagBaby (09.10.2026) ==================
// <name> = російська назва (з кешу перекладів ru-cache.json), <description> = російський опис,
// + характеристики з фіду MagBaby 15.xml, яких ще немає в товарі, + країна-виробник для MagBaby.
let RZ_STATS_ = null;
function rzEnrich_(xml) {
  const cache = prRuLoad_();
  const site = {};
  UrlFetchApp.fetch(SRC, { muteHttpExceptions: true }).getContentText('UTF-8').replace(/<offer\b([^>]*)>([\s\S]*?)<\/offer>/g, function (all, attrs, body) {
    const id = (attrs.match(/\bid="(\d+)"/) || [])[1];
    if (id) site[id] = { n: prTag_(body, 'name_ua') || prTag_(body, 'name'), d: prTag_(body, 'description_ua') };
    return '';
  });
  const st = { offers: 0, ruName: 0, ruDesc: 0, params: 0, country: 0 };
  const out = xml.replace(/<offer id="(\d+)"([^>]*)>([\s\S]*?)<\/offer>/g, function (all, id, attrs, body) {
    st.offers++;
    const s = site[id]; if (!s) return all;
    const vendor = (body.match(/<vendor>([^<]*)<\/vendor>/) || [])[1] || '';
    const sp = prSplitName_(s.n), m = cache.n[sp[0]];
    if (m) {
      let sz = (body.match(/<param name="Розмір">([^<]*)<\/param>/) || [])[1] || '';
      if (sz === '-') sz = '';
      sz = sz.replace(/^(\d+)см$/, '$1 см');
      const ru = [m, vendor, prTailRu_(sz)].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim() + ' (' + id + ')';
      body = body.replace(/<name>[\s\S]*?<\/name>/, '<name>' + prCdata_(ru) + '</name>'); st.ruName++;
    }
    const d = s.d && cache.d[prHash_(s.d)];
    if (d && !/<description>/.test(body)) { body = body.replace(/(<description_ua>[\s\S]*?<\/description_ua>)/, '$1\n<description>' + prCdata_(d) + '</description>'); st.ruDesc++; }
    let add = '';
    const mp = prMbParams_(s.n) || {};
    Object.keys(mp).forEach(function (k) { if (body.indexOf('<param name="' + k + '"') < 0) { add += '<param name="' + k + '">' + xmlEsc_(mp[k]) + '</param>\n'; st.params++; } });
    if (/^mag ?baby$/i.test(vendor) && !/<param name="Країна-виробник товару"/.test(body) && !/<param name="Країна виробник"/.test(body)) { add += '<param name="Країна-виробник товару">Україна</param>\n'; st.country++; }
    if (add) body = body.replace(/\s*$/, '\n' + add);
    return '<offer id="' + id + '"' + attrs + '>' + body + '</offer>';
  });
  RZ_STATS_ = st;
  return out;
}
function testRozetkaEnrich() {
  MP_PCT_ = MP_MARKUP.rozetka;
  const x = rzPics_(noLetimo_(addExtraRz_(rzEnrich_(buildRozetka_()))));
  Logger.log('rzEnrich: ' + JSON.stringify(RZ_STATS_) + ' offers=' + (x.match(/<offer /g) || []).length + ' bytes=' + x.length);
  const o = x.match(/<offer id="513"[\s\S]*?<\/offer>/);
  Logger.log(o ? o[0].replace(/<description(_ua)?>[\s\S]*?<\/description(_ua)?>/g, '[d]').replace(/<picture>[^<]*<\/picture>\n?/g, '') : 'no 513');
}

function testTv() {
  const s = '<offer id="1"><vendorCode>TV-03645-CHORN-4850</vendorCode><name_ua><![CDATA[Зимовий шолом Talvi "Фінн" з хутряними помпонами, чорний, 48-50 см]]></name_ua><keywords>x</keywords><keywords_ua>y</keywords_ua></offer>';
  Logger.log(tvKw_(s));
}


// ===== Talvi: власні ключові слова Prom (UA/RU), 18.10.2026 =====
const TV_KW = {
  '03645': { ua: ['шолом з помпонами', 'зимовий шолом дитячий', 'шапка шолом зимова', 'шолом з хутряними помпонами', 'шолом talvi фінн', 'дитячий шолом на флісі', 'шолом з помпонами {c}'],
             ru: ['шлем с помпонами', 'зимний шлем детский', 'шапка шлем зимняя', 'шлем с меховыми помпонами', 'шлем talvi финн', 'детский шлем на флисе', 'шлем с помпонами {c}'] },
  '03634': { ua: ['зимовий шолом дитячий', 'шапка шолом на флісі', 'однотонний шолом для дитини', 'шолом talvi твіо', 'теплий шолом унісекс', 'дитячий шолом {c}'],
             ru: ['зимний шлем детский', 'шапка шлем на флисе', 'однотонный шлем для ребенка', 'шлем talvi твио', 'теплый шлем унисекс', 'детский шлем {c}'] },
  '02425': { ua: ['шолом з вушками', 'зимовий шолом для малюка', 'шапка шолом з вушками', 'шолом talvi мімі', 'шолом на флісі для малюка', 'шолом з вушками {c}'],
             ru: ['шлем с ушками', 'зимний шлем для малыша', 'шапка шлем с ушками', 'шлем talvi мими', 'шлем на флисе для малыша', 'шлем с ушками {c}'] },
  '02383': { ua: ['шолом ведмедик', 'плюшевий шолом дитячий', 'шапка шолом з вушками', 'зимовий шолом зі штучного хутра', 'шолом talvi тедді', 'шолом ведмедик {c}'],
             ru: ['шлем мишка', 'плюшевый шлем детский', 'шапка шлем с ушками', 'зимний шлем из искусственного меха', 'шлем talvi тедди', 'шлем мишка {c}'] },
  '03483': { ua: ['шапка для новонароджених', 'тепла шапочка для немовляти', "шапка на зав'язках", 'зимова шапка для новонародженого', 'шапка talvi буся', 'шапка для новонароджених {c}'],
             ru: ['шапка для новорожденных', 'теплая шапочка для младенца', 'шапка на завязках', 'зимняя шапка для новорожденного', 'шапка talvi буся', 'шапка для новорожденных {c}'] },
  '05293': { ua: ['комплект шапка і хомут', 'шапка з помпоном дитяча', 'зимова шапка на флісі', 'дитячий комплект шапка хомут', 'комплект talvi освін', 'шапка з помпоном {c}'],
             ru: ['комплект шапка и хомут', 'шапка с помпоном детская', 'зимняя шапка на флисе', 'детский комплект шапка хомут', 'комплект talvi освин', 'шапка с помпоном {c}'] },
  '03717': { ua: ['демісезонний комплект шапка хомут', "шапка на зав'язках дитяча", 'весняна шапка з хомутом', 'комплект шапка і хомут', 'комплект talvi нео', "шапка на зав'язках {c}"],
             ru: ['демисезонный комплект шапка хомут', 'шапка на завязках детская', 'весенняя шапка с хомутом', 'комплект шапка и хомут', 'комплект talvi нео', 'шапка на завязках {c}'] },
  '03790': { ua: ['комплект шапка і хомут', 'шапка в рубчик дитяча', 'бавовняна шапка з хомутом', 'демісезонний комплект дитячий', 'комплект talvi космо', 'шапка в рубчик {c}'],
             ru: ['комплект шапка и хомут', 'шапка в рубчик детская', 'хлопковая шапка с хомутом', 'демисезонный комплект детский', 'комплект talvi космо', 'шапка в рубчик {c}'] },
  '04844': { ua: ['шапка з вушками тедді', 'дитяча шапка з вушками', 'шапка на флісі дитяча', 'бавовняна шапка з утепленням', 'шапка talvi кроп', 'шапка з вушками {c}'],
             ru: ['шапка с ушками тедди', 'детская шапка с ушками', 'шапка на флисе детская', 'хлопковая шапка с утеплением', 'шапка talvi кроп', 'шапка с ушками {c}'] },
  '04806': { ua: ['комплект шапка і манішка', 'шапка з помпоном для дівчинки', 'зимовий комплект для дівчинки', 'шапка на флісі з манішкою', 'комплект talvi агнеса', 'шапка з помпоном {c}'],
             ru: ['комплект шапка и манишка', 'шапка с помпоном для девочки', 'зимний комплект для девочки', 'шапка на флисе с манишкой', 'комплект talvi агнеса', 'шапка с помпоном {c}'] }
};
const TV_COL_RU = { 'бежевий': 'бежевый', 'чорний': 'черный', 'білий': 'белый', 'пудра': 'пудра', 'темно-синій': 'темно-синий', 'світлий хакі': 'светлый хаки', 'персик': 'персик', 'молочний': 'молочный', 'світлий беж': 'светлый беж', 'світла пудра': 'светлая пудра', 'світло-сірий': 'светло-серый', 'темна пудра': 'темная пудра', 'коричневий': 'коричневый', 'кава': 'кофейный', 'блакитний': 'голубой', 'світло-рожевий': 'светло-розовый', 'світла оливка': 'светлая олива', 'темна гірчиця': 'темная горчица' };
function tvKw_(xml) {
  let n = 0;
  const res = xml.replace(/<offer [\s\S]*?<\/offer>/g, function (o) {
    const art = (o.match(/TV-(\d{5})-/) || [])[1];
    if (!art || !TV_KW[art]) return o;
    const nm = (o.match(/<name_ua>(?:<!\[CDATA\[)?([^<\]]*)/) || [])[1] || '';
    const c = ((nm.match(/, ([^,]+), [\d-]+ см/) || [])[1] || '').trim();
    const ua = TV_KW[art].ua.map(function (s) { return s.replace('{c}', c); }).filter(function (s) { return s.indexOf('{c}') < 0 && s.trim(); }).join(', ');
    const ru = TV_KW[art].ru.map(function (s) { return s.replace('{c}', TV_COL_RU[c] || c); }).join(', ');
    n++;
    o = o.replace(/<keywords_ua>[\s\S]*?<\/keywords_ua>/, '<keywords_ua>' + xmlEsc_(ua) + '</keywords_ua>');
    o = o.replace(/<keywords>[\s\S]*?<\/keywords>/, '<keywords>' + xmlEsc_(ru) + '</keywords>');
    return o;
  });
  Logger.log('tvKw ' + n);
  return res;
}

function epiTalviFind() {
  const base = '/v2/pim/attribute-sets/166/attributes/brand/options';
  const P = PropertiesService.getScriptProperties(); const st = Number(P.getProperty('TV_BR_PAGE') || 400); let pages = st + 1; const found = []; let last = st;
  for (let page = st; page <= pages && page < st + 380; page++) { last = page;
    let r; try { r = epiGet_(base + '?page=' + page); } catch (e) { continue; }
    if (r.code !== 200) { Logger.log('page ' + page + ' HTTP ' + r.code); continue; }
    const j = JSON.parse(r.body); pages = j.pages || 1;
    (j.items || []).forEach(function (it) { const s = JSON.stringify(it.translations || []); if (/talvi|талві/i.test(s)) found.push(it.code + ' ' + s); });
  }
  P.setProperty('TV_BR_PAGE', String(last + 1));
  Logger.log('scanned ' + st + '-' + last + ' of ' + pages + ' found ' + found.join(' || '));
  if (false) epiSetAttrs_('166').forEach(function (a) { Logger.log('attr ' + a.c + ' | ' + a.n + ' | ' + a.t + ' | req ' + a.r); });
}

function epiTalviOpts() {
  epiSetAttrs_('166').forEach(function (a) {
    if (!a.r) return;
    let s = '';
    if (a.t === 'select' || a.t === 'multiselect') { try { const o = epiOptions_('166', a.c); s = Object.keys(o).length + ': ' + Object.keys(o).slice(0, 120).join(' | '); } catch (e) { s = 'ERR ' + e.message; } }
    Logger.log('REQ ' + a.c + ' | ' + a.n + ' | ' + a.t + ' | ' + s);
  });
}

// Talvi → Epicentr (набір 166): Тип / Колір виробника / Розмір з назви товару, 18.10.2026
const TV_EPI_COL = { 'чорний': ['чорний', 'black'], 'бежевий': ['бежевий'], 'білий': ['білий'], 'пудра': ['пудровий', 'пудра', 'рожевий'], 'темно-синій': ['темно-синій', 'синій'], 'світлий хакі': ['хакі', 'світлий хакі', 'оливковий'], 'персик': ['персиковий', 'персик'], 'молочний': ['молочний', 'білий'], 'світлий беж': ['світло-бежевий', 'бежевий'], 'світла пудра': ['пудровий', 'світло-рожевий', 'рожевий'], 'світло-сірий': ['світло-сірий', 'сірий'], 'темна пудра': ['темно-пудровий', 'пудровий', 'ліловий'], 'коричневий': ['коричневий'], 'кава': ['кавовий', 'коричневий'], 'блакитний': ['блакитний'], 'світло-рожевий': ['світло-рожевий', 'рожевий'], 'світла оливка': ['оливковий', 'світло-оливковий'], 'темна гірчиця': ['гірчичний', 'темно-гірчичний', 'жовтий'] };
const TV_EPI_SIZE = { '44-46': ['44-46', '45'], '48-50': ['48-50', '49'], '50-52': ['50-52', '51'], '48-52': ['48-52', '50'] };
function tvEpiVals_(a, name, opts) {
  const n = String(a.n).toLowerCase(), nm = String(name).toLowerCase();
  const pick = function (list) { for (let i = 0; i < list.length; i++) { if (opts[list[i]]) return [list[i]]; } return null; };
  if (n === 'тип') return pick(/комплект/.test(nm) ? ['набір'] : ['шапочка']);
  if (/колір виробника/.test(n)) { const c = (nm.match(/, ([^,]+), [\d-]+ см/) || [])[1]; return c ? pick(TV_EPI_COL[c.trim()] || [c.trim()]) : null; }
  if (n === 'розмір') { const s = (nm.match(/(\d+(?:-\d+)?) см/) || [])[1]; return s ? pick(TV_EPI_SIZE[s] || [s]) : null; }
  return null;
}

function epiTalviCol() { const o = epiOptions_('166', '78'); Logger.log(Object.keys(o).filter(function (k) { return /чорн|black|графіт/i.test(k); }).join(' | ')); }


function publishKasta() { return publishJob_('kasta'); }

function publishProm() { return publishJob_('prom'); }

// 30.10.2026: Епіцентр — заповнення обов'язкових полів для власного складу (Talvi, Timi Tex), яких не дає epiDerive_.
// Повертає лише значення, що є в довіднику Епіцентру (opts); якщо нічого не підійшло — товар лишається пропущеним, як раніше.
function ownEpiVals_(a, ctx, opts) {
  const keys = Object.keys(opts || {});
  const pick = function (cands) { const out = []; cands.forEach(function (c) { const k = keys.filter(function (x) { return x.toLowerCase() === String(c).toLowerCase(); })[0]; if (k && out.indexOf(k) < 0) out.push(k); }); return out; };
  const t = String(ctx.t || ''), n = a.n;
  // 31.10.2026: точкові значення для власних товарів, що випадали з фіду Епіцентру (звіт epiDiagOwn)
  const nm_ = String(ctx.nl || '');
  if (n === 'Базовий колір' && /лапки/.test(nm_)) return pick(['різнокольоровий']); // принт «лапки», як у сусідніх «зірочки»
  if (n === 'Матеріал' && /тедді/.test(nm_)) return pick(['велюр']); // плюш (віскоза/поліестер) — найближче з довідника Епіцентру
  if (n === 'Розмір' && /бейбік/.test(nm_)) { const r = pick(['0-12 міс', '0-12 міс.', '0-12', 'one size']); if (!r.length) Logger.log('EPI opts Розмір (Бейбік): ' + keys.slice(0, 60).join('|')); return r; }
  const words = (String(ctx.nl || '').toLowerCase().match(/(бежев|молочн|сір|біл|рожев|блакитн|пудр|персик|крем|син|чорн|коричнев|зелен|жовт|оливк|гірчиц|слив|сакур)[а-яіїєґ']*/g) || []);
  const colParam = String(ctx.color || '').toLowerCase();
  const BASE = { 'бежев': 'бежевий', 'молочн': 'білий', 'крем': 'бежевий', 'сір': 'сірий', 'біл': 'білий', 'рожев': 'рожевий', 'пудр': 'рожевий', 'блакитн': 'блакитний', 'син': 'синій', 'чорн': 'чорний', 'коричнев': 'коричневий', 'зелен': 'зелений', 'оливк': 'зелений', 'жовт': 'жовтий', 'гірчиц': 'жовтий', 'персик': 'рожевий', 'слив': 'фіолетовий', 'сакур': 'рожевий' };
  const baseOf = function (w) { const k = Object.keys(BASE).filter(function (p) { return w.indexOf(p) === 0; })[0]; return k ? BASE[k] : ''; };
  if (n === 'Вид') {
    if (/кокон/.test(t)) return pick(['конверт-кокон']);
    if (/чоловіч/.test(t)) {
      const c = [];
      if (/закрит\S* ніж/.test(t)) c.push('із закритими ніжками'); else if (/відкрит\S* ніж/.test(t)) c.push('з відкритими ніжками');
      if (/закрит\S* ручк/.test(t)) c.push('із закритими ручками'); else if (/відкрит\S* ручк/.test(t)) c.push('з відкритими ручками');
      if (!/коротк\S* рукав/.test(t)) c.push('з довгим рукавом');
      return pick(c);
    }
    return [];
  }
  if (n === 'Базовий колір') return pick([baseOf(colParam)].concat(words.map(baseOf)).filter(String).slice(0, 1));
  if (n === 'Колір виробника') return pick([colParam].concat(words, words.map(baseOf), [baseOf(colParam)]).filter(String)).slice(0, 1);
  if (n === 'Вік дитини') {
    const mm = (String(ctx.size || '') + ' ' + t).match(/(\d{2,3})\s*[\/-]\s*\d{2,3}/); const cm = mm ? Number(mm[1]) : 0;
    if (!cm) return [];
    const AGE = [[62, 'від народження'], [68, 'від 3 місяців'], [74, 'від 6 місяців'], [80, 'від 9 місяців'], [86, 'від 1 року'], [92, 'від 1,5 року'], [98, 'від 2 років'], [104, 'від 3 років'], [110, 'від 4 років'], [116, 'від 5 років']];
    const r = AGE.filter(function (x) { return cm <= x[0]; })[0];
    return r ? pick([r[1]]) : [];
  }
  if (n === 'Матеріал') return pick(['бавовна', 'поліестер', 'віскоза', 'фліс', 'акрил', 'вовна', 'еластан'].filter(function (w) { return t.indexOf(w.slice(0, 5)) > -1; }));
  return [];
}



// 03.11.2026: Talvi-дроп (артикули TALVI-) — наявність беремо напряму з таблиці залишків Talvi
// (оновлюється кожні 2 год), не чекаючи нічного файлу експорту Horoshop. Тільки TALVI-; решта фіду не змінюється.
const TV_DROP_SHEET_ID = '1ZAh8By5KHTX_YDADrLq9kYtFds8yiW_1GLaPp1TAT3I';
var TV_DROP_IDS_ = {};
function tvDropMap_() {
  if (tvDropMap_.m !== undefined) return tvDropMap_.m;
  tvDropMap_.m = null;
  try {
    const v = SpreadsheetApp.openById(TV_DROP_SHEET_ID).getSheetByName('Talvi_залишки').getDataRange().getValues();
    if (v.length < 3000) return null; // неповні дані — нічого не чіпаємо
    const m = {};
    for (let r = 1; r < v.length; r++) { const k = String(v[r][0]); if (/^TALVI-/.test(k)) m[k] = Number(v[r][7]) || 0; }
    tvDropMap_.m = m;
  } catch (e) { Logger.log('Talvi-дроп: таблиця залишків недоступна: ' + e.message); }
  return tvDropMap_.m;
}
function tvDropAvail_(xml) {
  // 04.11.2026: Google віддає максимум 50 МБ — експорт Horoshop (61 МБ) обрізається посередині офера. Відкидаємо обрізаний хвіст і закриваємо XML.
  if (!TV_SRC_CHUNKED_ && xml.indexOf('</offers>') < 0) { const p = xml.lastIndexOf('</offer>'); if (p > 0) { xml = xml.slice(0, p + 8) + '\n</offers>\n</shop>\n</yml_catalog>\n'; Logger.log('Експорт Horoshop обрізано Google (>50 МБ) — хвіст відкинуто, XML закрито'); } }
  const map = tvDropMap_();
  if (!map) return xml;
  // 04.11.2026: Talvi-дроп не в наявності прибираємо одразу (економія пам'яті на всіх етапах);
  // TV_DROP_MAX_ (якщо задано) — максимум позицій Talvi-дропу, зайве знімаємо цілими моделями (group_id).
  if (!TV_DROP_STATE_) TV_DROP_STATE_ = { g: {}, kept: 0 };
  const keptGroups = TV_DROP_STATE_.g; let kept = TV_DROP_STATE_.kept, cut = 0, capped = 0;
  const out = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>\s*/g, function (o) {
    const k = (o.match(/<vendorCode>(?:<!\[CDATA\[)?\s*(TALVI-[^<\]\s]+)/) || [])[1];
    if (!k) return o;
    TV_DROP_IDS_[(o.match(/<offer\b[^>]*\bid="([^"]+)"/) || [])[1]] = 1;
    const q = map[k] || 0;
    const price = Number((o.match(/<price>([\d.]+)<\/price>/) || [])[1] || 0);
    if (!(q > 0 && price > 0)) { cut++; return ''; }
    const g = (o.match(/group_id="([^"]+)"/) || [])[1] || k;
    if (TV_DROP_MAX_ && !keptGroups[g] && kept >= TV_DROP_MAX_) { capped++; return ''; }
    if (TV_DROP_MAX_ && keptGroups[g] === -1) { capped++; return ''; }
    keptGroups[g] = 1; kept++;
    // 04.11.2026: для маркетплейсів — опис Talvi без «Як обрати розмір» і FAQ (на сайті повний)
    o = o.replace(/<h3>(?:Як обрати розмір|Часті запитання)<\/h3>[\s\S]*?(?=\]\]>|<\/description)/g, '');
    return o.replace(/available="[^"]*"/, 'available="true"'); // 05.11.2026: у Horoshop для дропу буває available="" (порожньо) — раніше такі позиції лишались «не в наявності»
  });
  TV_DROP_STATE_.kept = kept;
  Logger.log('Talvi-дроп: лишено ' + kept + ', не в наявності прибрано ' + cut + (capped ? ', понад ліміт ' + TV_DROP_MAX_ + ' знято ' + capped : ''));
  return out;
}
var TV_DROP_MAX_ = 0;
function tvDropAvailTest() {
  const xml = UrlFetchApp.fetch(SRC, { muteHttpExceptions: true }).getContentText('UTF-8');
  const cnt = function (x) { let all = 0, av = 0; (x.match(/<offer\b[^>]*>[\s\S]*?<\/offer>/g) || []).forEach(function (o) { if (/<vendorCode>(?:<!\[CDATA\[)?\s*TALVI-/.test(o)) { all++; if (/available="true"/.test(o)) av++; } }); return all + ' TALVI, в наявності ' + av; };
  const mp = tvDropMap_(); Logger.log('Таблиця Talvi: ' + (mp ? Object.keys(mp).length + ' артикулів, в наявності ' + Object.keys(mp).filter(function (k) { return mp[k] > 0; }).length : 'НЕ ПРОЧИТАНА'));
  const out = tvDropAvail_(xml);
  Logger.log('ДО: ' + cnt(xml) + ' | ПІСЛЯ: ' + cnt(out) + ' | офферів усього ' + (xml.match(/<offer\b/g) || []).length + ' → ' + (out.match(/<offer\b/g) || []).length + ' | довжина ' + xml.length + ' → ' + out.length);
}

// 03.11.2026 (рішення Дмитра): на Prom Talvi-дроп (TALVI-) іде тільки «в наявності» — ліміт тарифу 10 000 позицій.
function tvPromDropFilter_(xml) {
  let cut = 0;
  const out = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>\s*/g, function (o) {
    if (!/<vendorCode>(?:<!\[CDATA\[)?\s*TALVI-/.test(o)) return o;
    if (/available="true"/.test(o)) return o;
    cut++; return '';
  });
  Logger.log('Prom: прибрано Talvi-дроп не в наявності: ' + cut);
  // запобіжник тарифу Prom: не більше TV_PROM_CAP позицій у файлі; зайве Talvi знімаємо цілими моделями (group_id) з кінця
  const TV_PROM_CAP = 45000; // 04.11.2026: тариф Prom = 10 000 товарів (груп) і 50 000 різновидів, а не 10 000 позицій — раніше стояло 9500
  const total = (out.match(/<offer\b/g) || []).length;
  if (total <= TV_PROM_CAP) return out;
  let over = total - TV_PROM_CAP;
  const groups = [], seen = {};
  (out.match(/<offer\b[^>]*>[\s\S]*?<\/offer>/g) || []).forEach(function (o) {
    if (!/<vendorCode>(?:<!\[CDATA\[)?\s*TALVI-/.test(o)) return;
    const g = (o.match(/group_id="([^"]+)"/) || [])[1] || o.slice(0, 60);
    if (!seen[g]) { seen[g] = { g: g, n: 0 }; groups.push(seen[g]); }
    seen[g].n++;
  });
  const drop = {};
  for (let i = groups.length - 1; i >= 0 && over > 0; i--) { drop[groups[i].g] = 1; over -= groups[i].n; }
  let cut2 = 0;
  const out2 = out.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>\s*/g, function (o) {
    if (!/<vendorCode>(?:<!\[CDATA\[)?\s*TALVI-/.test(o)) return o;
    const g = (o.match(/group_id="([^"]+)"/) || [])[1] || o.slice(0, 60);
    if (drop[g]) { cut2++; return ''; }
    return o;
  });
  Logger.log('Prom: ліміт ' + TV_PROM_CAP + ' — знято ще Talvi ' + cut2 + ' позицій (' + Object.keys(drop).length + ' моделей)');
  return out2;
}
function tvPromDropTest() {
  MP_PCT_ = MP_MARKUP.prom;
  const x = promFix_(promEnrich_(buildFeed_()));
  const y = tvPromDropFilter_(x);
  const c = function (s) { return (s.match(/<offer\b/g) || []).length; };
  const t = function (s) { return (s.match(/<vendorCode>(?:<!\[CDATA\[)?\s*TALVI-/g) || []).length; };
  Logger.log('Prom офферів: ' + c(x) + ' → ' + c(y) + ' | Talvi: ' + t(x) + ' → ' + t(y));
}

// 04.11.2026: діагностика і ручна публікація Prom
function diagPubProm() {
  const t0 = Date.now(); MP_PCT_ = MP_MARKUP.prom; let x;
  try { x = tvPromDropFilter_(kwV3_(toysKw_(promFix_(promEnrich_(buildFeed_()))))); }
  catch (e) { Logger.log('BUILD ERR ' + e.message + ' at ' + (Date.now() - t0) / 1000 + 's'); return; }
  Logger.log('build ' + (Date.now() - t0) / 1000 + 's, символів ' + x.length + ', офферів ' + (x.match(/<offer\b/g) || []).length);
  try { ghPublishBig_('prom.xml', x, 'prom ' + Utilities.formatDate(new Date(), 'Europe/Kyiv', 'yyyy-MM-dd HH:mm')); Logger.log('publish OK ' + (Date.now() - t0) / 1000 + 's'); }
  catch (e) { Logger.log('PUBLISH ERR ' + String(e.message).slice(0, 300) + ' at ' + (Date.now() - t0) / 1000 + 's'); }
}

// 04.11.2026: великі фіди (Prom з Talvi ~47 МБ) не влазять у пам'ять/ліміт 50 МБ при публікації на GitHub.
// Публікуємо як .gz (Prom приймає Gzip). Якщо файл ≤ 30 МБ — ще й звичайний .xml.
function ghPublishBig_(name, text, msg) {
  // 04.11.2026: мінімум копій у пам'яті — одразу в Blob і gzip, без окремого масиву байтів
  if (typeof oosPatch_ === 'function') text = oosPatch_(text);
  const chars = text.length;
  let blob = Utilities.newBlob(text, 'application/xml', name);
  text = null;
  const gz = Utilities.gzip(blob, name + '.gz').getBytes();
  blob = null;
  const blobs = {};
  blobs[name + '.gz'] = gh_('post', '/git/blobs', { content: Utilities.base64Encode(gz), encoding: 'base64' }).sha;
  const head = gh_('get', '/git/ref/heads/' + GH_BRANCH).object.sha;
  const baseTree = gh_('get', '/git/commits/' + head).tree.sha;
  const tree = Object.keys(blobs).map(function (f) { return { path: f, mode: '100644', type: 'blob', sha: blobs[f] }; });
  const treeSha = gh_('post', '/git/trees', { base_tree: baseTree, tree: tree }).sha;
  const commit = gh_('post', '/git/commits', { message: msg + ' (' + Math.round(chars / 1048576) + 'M симв, gz ' + Math.round(gz.length / 1048576 * 10) / 10 + ' MB)', tree: treeSha, parents: [head] }).sha;
  gh_('patch', '/git/refs/heads/' + GH_BRANCH, { sha: commit, force: true });
  Logger.log(name + ': ' + Math.round(chars / 1048576) + 'M символів → gz ' + Math.round(gz.length / 1048576 * 10) / 10 + ' MB');
}

function diagRozetka() {
  const t0 = Date.now(); MP_PCT_ = MP_MARKUP.rozetka;
  const x = rzgDedupe_(rzGroup_(rzModFix_(tvBarcode_(rzPics_(noLetimo_(addExtraRz_(rzEnrich_(buildRozetka_()))))))));
  const sz = function (s) { return Math.round(Utilities.newBlob(s).getBytes().length / 1048576 * 10) / 10; };
  const tv = (x.match(/<offer\b[^>]*>[\s\S]*?<\/offer>/g) || []).filter(function (o) { return /TALVI-|<vendor>Talvi<\/vendor>/.test(o); });
  Logger.log('build ' + (Date.now() - t0) / 1000 + 's; офферів ' + (x.match(/<offer\b/g) || []).length + '; Talvi ' + tv.length + ' (в наявн ' + tv.filter(function (o) { return /available="true"/.test(o); }).length + '); розмір ' + sz(x) + ' MB; Talvi-частина ' + sz(tv.join('')) + ' MB; приклад Talvi ' + (tv[0] || '').length + ' симв');
}

// 04.11.2026: Rozetka — Talvi-дроп лише «в наявності» (розмір фіду, ліміт пам'яті Google). Визначаємо за id з tvDropAvail_.
function tvDropOnlyAvail_(xml) {
  let cut = 0;
  const out = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>\s*/g, function (o) {
    const id = (o.match(/<offer\b[^>]*\bid="(?:rzid_)?([^"]+)"/) || [])[1];
    const isDrop = (id && TV_DROP_IDS_[id]) || /<vendorCode>(?:<!\[CDATA\[)?\s*TALVI-/.test(o);
    if (!isDrop || /available="true"/.test(o)) return o;
    cut++; return '';
  });
  Logger.log('Talvi-дроп не в наявності прибрано: ' + cut);
  return out;
}

// 04.11.2026: економна публікація великого фіду — у пам'яті одночасно мінімум копій (ліміт пам'яті Google).
function ghPublishLean_(name, produce, msg) {
  let t = produce();
  const n = (t.match(/<offer /g) || []).length;
  if (n < 1000) throw new Error(name + ': у фіді лише ' + n + ' товарів — не публікую');
  if (typeof oosPatch_ === 'function') t = oosPatch_(t);
  const size = t.length; // символів
  const p = PropertiesService.getScriptProperties();
  const api = 'https://api.github.com/repos/' + p.getProperty('GH_REPO');
  const hdr = { Authorization: 'Bearer ' + p.getProperty('GH_TOKEN'), Accept: 'application/vnd.github+json' };
  let payload = '{"encoding":"utf-8","content":' + JSON.stringify(t) + '}';
  t = null;
  const res = UrlFetchApp.fetch(api + '/git/blobs', { method: 'post', contentType: 'application/json; charset=utf-8', muteHttpExceptions: true, headers: hdr, payload: payload });
  payload = null;
  if (res.getResponseCode() >= 300) throw new Error('GitHub blob ' + res.getResponseCode() + ': ' + res.getContentText().slice(0, 200));
  const blobSha = JSON.parse(res.getContentText()).sha;
  const head = gh_('get', '/git/ref/heads/' + GH_BRANCH).object.sha;
  const baseTree = gh_('get', '/git/commits/' + head).tree.sha;
  const treeSha = gh_('post', '/git/trees', { base_tree: baseTree, tree: [{ path: name, mode: '100644', type: 'blob', sha: blobSha }] }).sha;
  const commit = gh_('post', '/git/commits', { message: msg + ' (' + Math.round(size / 1048576) + 'M симв)', tree: treeSha, parents: [head] }).sha;
  gh_('patch', '/git/refs/heads/' + GH_BRANCH, { sha: commit, force: true });
  Logger.log(name + ' опубліковано: ' + n + ' офферів, ' + Math.round(size / 1048576 * 10) / 10 + 'M символів');
  return n;
}

// 04.11.2026: запобіжник пам'яті — якщо фід довший за maxChars символів, знімаємо Talvi-дроп цілими моделями (group_id) з кінця.
function tvCapChars_(xml, maxChars) {
  if (xml.length <= maxChars) return xml;
  const offers = xml.match(/<offer\b[^>]*>[\s\S]*?<\/offer>\s*/g) || [];
  const groups = [], seen = {};
  offers.forEach(function (o) {
    const id = (o.match(/<offer\b[^>]*\bid="(?:rzid_)?([^"]+)"/) || [])[1];
    const isDrop = (id && TV_DROP_IDS_[id]) || /<vendorCode>(?:<!\[CDATA\[)?\s*TALVI-/.test(o);
    if (!isDrop) return;
    const g = (o.match(/group_id="([^"]+)"/) || [])[1] || ('a' + ((o.match(/<article>([^<-]+)/) || [])[1] || id));
    if (!seen[g]) { seen[g] = { g: g, len: 0, n: 0 }; groups.push(seen[g]); }
    seen[g].len += o.length; seen[g].n++;
  });
  let over = xml.length - maxChars; const drop = {}; let models = 0, cnt = 0;
  for (let i = groups.length - 1; i >= 0 && over > 0; i--) { drop[groups[i].g] = 1; over -= groups[i].len; models++; cnt += groups[i].n; }
  const out = xml.replace(/<offer\b[^>]*>[\s\S]*?<\/offer>\s*/g, function (o) {
    const id = (o.match(/<offer\b[^>]*\bid="(?:rzid_)?([^"]+)"/) || [])[1];
    const isDrop = (id && TV_DROP_IDS_[id]) || /<vendorCode>(?:<!\[CDATA\[)?\s*TALVI-/.test(o);
    if (!isDrop) return o;
    const g = (o.match(/group_id="([^"]+)"/) || [])[1] || ('a' + ((o.match(/<article>([^<-]+)/) || [])[1] || id));
    return drop[g] ? '' : o;
  });
  Logger.log('Запобіжник розміру: знято Talvi-дроп ' + cnt + ' позицій (' + models + ' моделей), ' + xml.length + ' → ' + out.length + ' симв');
  return out;
}

// 04.11.2026: експорт Horoshop >50 МБ (ліміт Google) — читаємо шматками через HTTP Range,
// кожен шматок одразу чистимо (Talvi не в наявності, скорочені описи), щоб економити пам'ять.
var TV_SRC_CHUNKED_ = false, TV_DROP_STATE_ = null;
function utf8Len_(s) { let n = 0; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); if (c < 0x80) n += 1; else if (c < 0x800) n += 2; else if (c >= 0xD800 && c <= 0xDBFF) { n += 4; i++; } else n += 3; } return n; }
function srcXml_() {
  TV_SRC_CHUNKED_ = true; TV_DROP_STATE_ = null;
  const CH = 16 * 1024 * 1024; const parts = []; let start = 0, total = 0;
  for (let guard = 0; guard < 30; guard++) {
    const r = UrlFetchApp.fetch(SRC, { muteHttpExceptions: true, headers: { Range: 'bytes=' + start + '-' + (start + CH - 1), 'Accept-Encoding': 'identity' } });
    const code = r.getResponseCode();
    if (code === 200) { TV_SRC_CHUNKED_ = false; Logger.log('Range не підтримано (HTTP 200) — читаю цілим'); parts.push(tvDropAvail_(r.getContentText('UTF-8'))); break; }
    if (code !== 206) throw new Error('Horoshop feed HTTP ' + code);
    const h = r.getHeaders(); const cr = h['Content-Range'] || h['content-range'] || '';
    total = Number((cr.match(/\/(\d+)/) || [])[1] || 0);
    let s = r.getContentText('UTF-8');
    const last = !total || start + CH >= total;
    if (!last) { const p = s.lastIndexOf('</offer>'); if (p < 0) throw new Error('Шматок експорту без </offer>'); s = s.slice(0, p + 8); start += utf8Len_(s); }
    parts.push(tvDropAvail_(s)); s = null;
    if (last) break;
  }
  TV_SRC_CHUNKED_ = false;
  const out = parts.join('');
  Logger.log('Експорт прочитано шматками: ' + parts.length + ', ' + Math.round(total / 1048576) + ' МБ → ' + Math.round(out.length / 1048576) + 'M символів');
  return out;
}
function srcRes_() { return { getResponseCode: function () { return 200; }, getContentText: function () { return srcXml_(); } }; }
function srcTest() { const x = srcXml_(); Logger.log('офферів ' + (x.match(/<offer\b/g) || []).length + ', Talvi ' + (x.match(/<vendorCode>(?:<!\[CDATA\[)?\s*TALVI-/g) || []).length + ', кінець OK ' + /<\/yml_catalog>\s*$/.test(x)); }

// 04.11.2026: службове — вивантажити код цього проєкту в приватну таблицю Talvi (аркуш SRC_dump) для перенесення на GitHub Actions.
// Потрібен доступ до Диска: DriveApp.getFiles() (для експорту коду проєкту).
function dumpSrcToSheet() {
  const url = 'https://script.google.com/feeds/download/export?id=' + ScriptApp.getScriptId() + '&format=json';
  const r = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) { Logger.log('export HTTP ' + r.getResponseCode() + ' ' + r.getContentText().slice(0, 300)); return; }
  const t = r.getContentText();
  const ss = SpreadsheetApp.openById(TV_DROP_SHEET_ID);
  const sh = ss.getSheetByName('SRC_dump') || ss.insertSheet('SRC_dump');
  sh.clear();
  const rows = []; for (let i = 0; i < t.length; i += 40000) rows.push(['\'' + t.slice(i, i + 40000)]);
  sh.getRange(1, 1, rows.length, 1).setValues(rows);
  Logger.log('SRC_dump: ' + t.length + ' символів, ' + rows.length + ' рядків');
}
