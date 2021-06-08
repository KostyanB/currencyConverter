document.addEventListener('DOMContentLoaded', () => {

	const choiceCurrency = document.getElementById('choice-currency'),
		choiceDirection = document.getElementById('choice-direction'),
		defaultSelect = document.getElementById('default-select'),
		inputData = document.querySelector('.input-data'),
		outputData = document.querySelector('.output-data'),
		result = document.getElementById('result'),
		incomeData = document.querySelector('.income-data'),
		resultData = document.querySelector('.result-data'),
		showError = document.querySelector('.show-error'),
		rubCurrency = ' Российский рубль (RUB)',
		defaultCurrency = ' Выбранная валюта';
	choiceDirection.setAttribute('hidden', 'true');

	// запрет ввода не цифр
	inputData.addEventListener('input', e => {
		e.target.value = e.target.value.replace(/[^0-9\.]/g, "");
	});

	// калькулятор
	const calc = targetCurrency => {
		result.addEventListener('click', () => {
			if (incomeData.value && targetCurrency) {
				if (choiceDirection.value === 'direct') {
					resultData.value = (incomeData.value / targetCurrency.Value).toFixed(2);
				} else if (choiceDirection.value === 'inverse') {
					resultData.value = (incomeData.value * targetCurrency.Value).toFixed(2);
				}
			} else {
				resultData.value = '';
			}
		});
	};
	// очистка селектора
	const clearCurrency = () => {
		inputData.childNodes[3].textContent = defaultCurrency;
		outputData.childNodes[3].textContent = defaultCurrency;
		resultData.value = '';
	};

	// устанавливаем отображение выбранных валют
	const setCurrency = targetCurrency => {
		let textCurrency;
		if (targetCurrency.Nominal > 1) {
			textCurrency = `*${targetCurrency.Nominal} ${targetCurrency.Name} (${targetCurrency.CharCode})`;
		} else {
			textCurrency = `${targetCurrency.Name} (${targetCurrency.CharCode})`;
		}
		if (choiceDirection.value === 'direct') {
			inputData.childNodes[3].textContent = rubCurrency;
			outputData.childNodes[3].textContent = textCurrency;
		} else if (choiceDirection.value === 'inverse') {
			inputData.childNodes[3].textContent = textCurrency;
			outputData.childNodes[3].textContent = rubCurrency;
		}
	};
	// селектор валют
	const selectValute = data => {
		document.addEventListener('change', e => {
			const targetValute = data.get(choiceCurrency.value);
			if (e.target === choiceCurrency) {
				if (e.target.value !== 'no') {
					choiceDirection.removeAttribute('hidden');
					resultData.value = '';
					setCurrency(targetValute);
					calc(targetValute);

				} else {
					choiceDirection.setAttribute('hidden', 'true');
					choiceDirection.value = 'no';
					clearCurrency();
				}
			}
			if (e.target === choiceDirection) {
				if (e.target.value !== 'no') {
					resultData.value = '';
					setCurrency(targetValute);
					calc(targetValute);
				} else if (e.target.value === 'no') {
					clearCurrency();
				}
			}
		});
	};
	// формирование селектора валют
	const setCurrencySelect = data => {
		const valuteBase = new Map(Object.entries(data.Valute));
		valuteBase.forEach((item, key) => {
			const {
				Nominal: nominal,
				Name: nameCurr,
			} = item;
			const valuteNode = defaultSelect.cloneNode();
			valuteNode.setAttribute('value', key);

			if (nominal > 1) {
				valuteNode.textContent = `${nominal} ${nameCurr} (${key})`;
			} else {
				valuteNode.textContent = `${nameCurr} (${key})`;
			}
			choiceCurrency.appendChild(valuteNode);
			selectValute(valuteBase);
		});
	};

	// получение базы валют по API
	const getCurrencyDataBase = () => {
		fetch('https://www.cbr-xml-daily.ru/daily_json.js', {
			method: 'GET',
		})
			.then(response => {
				if (response.status !== 200) {
					throw new Error('Status network not 200');
				}
				return response.json();
			})
			.then(setCurrencySelect) //передаем в формирование селектора
			.catch(error => {
				showError.textContent = ' Нет связи с сервером банка, попробуйте позже';
				console.error(error);
			});
	};
	getCurrencyDataBase();

});
