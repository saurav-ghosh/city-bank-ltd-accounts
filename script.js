"use strict";

//ACCOUNT DATA
const account1 = {
    owner: "Saurav Ghosh",
    movements: [200.67, 450, -400.945, 3000.3626, -650, -130.9656, 70, 1300],
    interestRate: 1.2, // %
    pin: 1111,
    movementsDates: [
        "2019-11-18T21:31:17.178Z",
        "2019-12-23T07:42:02.383Z",
        "2020-01-28T09:15:04.904Z",
        "2021-04-10T10:17:24.185Z",
        "2021-09-11T14:11:59.604Z",
        "2021-09-13T17:01:17.194Z",
        "2021-09-14T23:36:17.929Z",
        "2021-09-15T10:51:36.790Z",
    ],
    currency: "EUR",
    locale: "de-DE", // GERMANY
};

const account2 = {
    owner: "Elon Mask",
    movements: [5000, 3400.665, -150, -790.656, -3210, -1000, 8500.978, -30],
    interestRate: 1.5,
    pin: 2222,
    movementsDates: [
        "2019-11-01T13:15:33.035Z",
        "2019-11-30T09:48:16.867Z",
        "2019-12-25T06:04:23.907Z",
        "2020-01-25T14:18:46.235Z",
        "2020-02-05T16:33:06.386Z",
        "2020-04-10T14:43:26.374Z",
        "2020-06-25T18:49:59.371Z",
        "2020-07-26T12:01:20.894Z",
    ],
    currency: "USD",
    locale: "en-US", // UNITED STATES
};

const accounts = [account1, account2];

// ELEMENTS
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance_value");
const labelSumIn = document.querySelector(".summary_value_in");
const labelSumOut = document.querySelector(".summary_value_out");
const labelInterest = document.querySelector(".summary_value_interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login_btn");
const btnTransfer = document.querySelector(".form_btn_transfer");
const btnLoan = document.querySelector(".form_btn_loan");
const btnClose = document.querySelector(".form_btn_close");
const btnSort = document.querySelector(".btn_sort");

const inputLoginUser = document.querySelector(".login_input_user");
const inputLoginPin = document.querySelector(".login_input_pin");
const inputTransferTo = document.querySelector(".form_input_to");
const inputTransferAmount = document.querySelector(".form_input_amount");
const inputLoanAmount = document.querySelector(".form_input_loan_amount");
const inputCloseUsername = document.querySelector(".form_input_user");
const inputClosePin = document.querySelector(".form_input_Pin");

// ----------- APP FUNCTIONALITY -----------

// CALCULATE MOVEMENTS DATES
const calcMovementsDate = (date, locale) => {
    const calcPassedDays = (date1, date2) =>
        Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));

    const calcDays = calcPassedDays(new Date(), date);

    if (calcDays === 0) return "Today";
    if (calcDays === 1) return "Yesterday";
    if (calcDays <= 7) return `${calcDays} Days Ago`;

    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
};

//FORMAT CURRENCY USING LOCATION
const formatCur = (value, locale, currency) => {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(value);
};

// DISPLAYING ALL MOVEMENTS
const displayMovements = (acc, sort = false) => {
    containerMovements.innerHTML = "";

    const sortedMovs = acc.movements.slice().sort((a, b) => a - b);
    const movs = sort ? sortedMovs : acc.movements;

    movs.forEach((mov, i) => {
        const type = mov > 0 ? "deposit" : "withdrawal";

        const date = new Date(acc.movementsDates[i]);
        const displayDates = calcMovementsDate(date, acc.locale);

        const formattedMov = formatCur(mov, acc.locale, acc.currency);

        const html = `
            <div class="movements_row">
                <div class="movements_type movements_type_${type}">
                    ${i + 1} ${type}
                </div>
                <div class="movements_date">${displayDates}</div>
                <div class="movements_value">${formattedMov}</div>
            </div>
        `;

        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
};

//DISPLAYING AVAILABLE AMOUNT
const calcDisplayBalance = (acc) => {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
    // labelBalance.textContent = `${acc.balance.toFixed(2)} €`;
};

//DISPLAYING SUMMARIES
const calcDisplaySummary = (acc) => {
    const deposits = acc.movements
        .filter((mov) => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);

    labelSumIn.textContent = formatCur(deposits, acc.locale, acc.currency);
    // labelSumIn.textContent = `${deposits.toFixed(2)} €`;

    const withdrawals = acc.movements
        .filter((mov) => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);

    labelSumOut.textContent = formatCur(
        Math.abs(withdrawals),
        acc.locale,
        acc.currency
    );
    // labelSumOut.textContent = `${Math.abs(withdrawals).toFixed(2)} €`;

    const interests = acc.movements
        .filter((int) => int > 0)
        .map((int) => (int * acc.interestRate) / 100)
        .filter((int) => int >= 1)
        .reduce((acc, int) => acc + int, 0);

    labelInterest.textContent = formatCur(interests, acc.locale, acc.currency);
    // labelInterest.textContent = `${interests.toFixed(2)} €`;
};

// CREATING SHORTHAND USERNAME ("SAURAV GHOSH" = 'sg')
const createUserName = (accs) => {
    accs.forEach((acc) => {
        acc.username = acc.owner
            .toLowerCase()
            .split(" ")
            .map((name) => name[0])
            .join("");
    });
};
createUserName(accounts);

//UPDATE UI
const updateUI = (acc) => {
    //DISPLAY MOVEMENTS
    displayMovements(acc);

    //DISPLAY BALANCE
    calcDisplayBalance(acc);

    //DISPLAY SUMMARY
    calcDisplaySummary(acc);
};

//AUTOMATIC LOG OUT TIMER
const startLogOutTimer = () => {
    let time = 600;

    const tick = () => {
        const min = String(Math.trunc(time / 60)).padStart(2, "0");
        const sec = String(time % 60).padStart(2, "0");
        labelTimer.textContent = `${min}: ${sec}`;

        if (time === 0) {
            clearInterval(timer);
            containerApp.style.opacity = 0;
            labelWelcome.textContent = "Log in to get started";
        }
        time--;
    };

    tick();
    const timer = setInterval(tick, 1000);

    return timer;
};

//DETECT CURRENT/LOGGED IN ACCOUNT
let currentAccount, timer;

btnLogin.addEventListener("click", (e) => {
    e.preventDefault();

    currentAccount = accounts.find(
        (acc) => acc.username === inputLoginUser.value
    );

    if (currentAccount?.pin === +inputLoginPin.value) {
        // DISPLAY UI & MESSAGE
        containerApp.style.opacity = 100;
        labelWelcome.textContent = `Welcome back, ${
            currentAccount.owner.split(" ")[0]
        }`;

        //SETTING CURRENT DATE & TIME ON AVAILABLE BALANCE STATUS
        const now = new Date();
        const options = {
            hour: "numeric",
            minute: "numeric",
            day: "numeric",
            month: "numeric",
            year: "numeric",
        };

        // const locale = navigator.language;
        labelDate.textContent = new Intl.DateTimeFormat(
            currentAccount.locale,
            options
        ).format(now);

        // const now = new Date();
        // const day = `${now.getDate()}`.padStart(2, 0);
        // const month = `${now.getMonth() + 1}`.padStart(2, 0);
        // const year = now.getFullYear();
        // const hours = `${now.getHours()}`.padStart(2, 0);
        // const min = `${now.getMinutes()}`.padStart(2, 0);
        // labelDate.textContent = `${day}/${month}/${year}, ${hours}:${min}`;

        //CLEAR INPUT FIELDS
        inputLoginUser.value = inputLoginPin.value = "";
        inputLoginPin.blur();

        //LOG OUT TIMER
        if (timer) clearInterval(timer);
        timer = startLogOutTimer();

        //UPDATE UI
        updateUI(currentAccount);
    }
});

// TRANSFER MONEY
btnTransfer.addEventListener("click", (e) => {
    e.preventDefault();

    const amount = +inputTransferAmount.value;
    const receiverAcc = accounts.find(
        (acc) => acc.username === inputTransferTo.value
    );

    if (
        amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc?.username !== currentAccount.username
    ) {
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);

        //ADD LOAN DATE
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());

        //UPDATE UI
        updateUI(currentAccount);

        //RESET TIMER
        clearInterval(timer);
        timer = startLogOutTimer();

        inputTransferTo.value = inputTransferAmount.value = "";
        inputTransferAmount.blur();
    }
});

//REQUEST LOAN
btnLoan.addEventListener("click", (e) => {
    e.preventDefault();

    const loanAmount = Math.floor(inputLoanAmount.value);
    if (
        loanAmount > 0 &&
        currentAccount.movements.some((mov) => mov >= loanAmount * 0.1)
    ) {
        setTimeout(() => {
            currentAccount.movements.push(loanAmount);

            //ADD LOAN DATE
            currentAccount.movementsDates.push(new Date().toISOString());

            //UPDATE UI
            updateUI(currentAccount);

            //RESET TIMER
            clearInterval(timer);
            timer = startLogOutTimer();

            inputLoanAmount.value = "";
            inputLoanAmount.blur();
        }, 3000);
    }
});

//CLOSE ACCOUNT
btnClose.addEventListener("click", (e) => {
    e.preventDefault();

    if (
        inputCloseUsername.value === currentAccount.username &&
        +inputClosePin.value === currentAccount.pin
    ) {
        const index = accounts.findIndex(
            (acc) => acc.username === currentAccount.username
        );
        accounts.splice(index, 1);

        //DELETE UI
        containerApp.style.opacity = 0;

        //CLEARING INPUT FIELDS
        inputCloseUsername.value = inputClosePin.value = "";

        // WELCOME GREETINGS INITIALIZATION
        labelWelcome.textContent = "Log in to get started";
    }
});

//SORTING MOVEMENTS
let sorted = false;

btnSort.addEventListener("click", (e) => {
    e.preventDefault();

    displayMovements(currentAccount, !sorted);

    sorted = !sorted;
});
