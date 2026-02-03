const addTwoNumbers = (a,b) => a + b;

const findAreaOfCircle = (radius) => {
    if (radius < 0){
        return "Not Possible"
    }else{
        return Math.PI * radius * radius;
    }
}

const findCircumference = (radius) => {
    return Math.PI * radius * radius;
}


const findRadius = (area) => {
    return Math.sqrt(area / Math.PI);
}


const body = {
    "id": 1,
    "email": "elias@mail.com",
    "password": "matrixcode"
}
// const id = body.id
// const email = body.email;
// const password = body.password;
const { id, email, password } = body

// console.log(id);
// console.log(email);
// console.log(password);



const numbers = [1, 2 ,3];

const [num1, num2, num3] = numbers

console.log(num1);
console.log(num2);
console.log(num3);




// const users = [
//     { name: "Alice", age: 25 },
//     { name: "Bob", age: 30 }
// ];

// const newArray = users.map((user) => `${user.name} is ${user.age}`);

// console.log(newArray);