// access to elements for menu

const menuIcon = document.querySelector('.menu-icon i');
const minusIcon = document.querySelector('.menu i')
const menu = document.querySelector('.menu');
const backDrop = document.querySelector('.backdrop');
// console.log(menu);


// add events

menuIcon.addEventListener('click',addMenu)

minusIcon.addEventListener('click',removeMenu)

backDrop.addEventListener('click',removeMenu)



// functions

function addMenu(){
    menu.style.opacity = '1';
    menu.style.transform = 'translateX(0)';
    backDrop.style.display = 'block';
}

function removeMenu(){
    menu.style.opacity = '0';
    menu.style.transform = 'translateX(-100vh)';
    backDrop.style.display = 'none';
}



// access to elements for modal

const cartBtn = document.querySelector('.cart-btn');
const backDrop1 = document.querySelector('.backdrop-m');
const cartModal = document.querySelector('.cart');
const closeModal = document.querySelector('.cart-item-confirm');


const productsDom = document.querySelector('.products-center');
const cartTotal = document.querySelector('.cart-total');
const cartItems = document.querySelector('.cart-items');
const cartContent = document.querySelector('.cart-content');
const clearCart = document.querySelector('.clear-cart');
// console.log(addTocartBtn);


import {productsData} from "./products.js";

let cart = [];
let buttonsDOM = [];

// 1. get products

class Products{
    // get from api end point !
    getProduct(){
        return productsData;
    }
}


// 2. display product

class UI{
    displayProducts(Product){
        let result = "";
        Product.forEach((item)=> {
            result += `<div class="product">
            <div class="img-container">
            <img class="product-img" src=${item.imageUrl}>
            </div>
            <div class="product-description">
            <p class="product-title">product title : ${item.title}</p>
            <p class="product-price">price : ${item.price}</p>
            </div>
            <button class="add-to-cart" data-id=${item.id}>
            add to cart
            </button>
            </div>`;
            
            productsDom.innerHTML = result;
        });
    }
    
    getAddToCartBtn(){
        const addTocartBtn =[...document.querySelectorAll('.add-to-cart')];
        buttonsDOM = addTocartBtn;

        addTocartBtn.forEach((btn)=>{
            const id = btn.dataset.id;
            // check if this product id is in cart or not
            const isInCart = cart.find((p) => p.id === parseInt(id));

            if(isInCart){
                btn.innerText = 'in cart';
                btn.disabled = true;
            }

            btn.addEventListener('click',(event)=>{
                event.target.innerHTML = 'in cart';
                event.target.disabled = true;
                // get product from products 
                const addedProduct ={...Storage.getProduct(id), quantity: 1};
                // add to cart
                cart = [...cart,addedProduct];
                // save cart to local storage
                Storage.saveCart(cart);
                // update cart value
                this.setCartValue(cart);
                // add to cart item
                this.addCartItem(addedProduct);

            })
        });
    }

    setCartValue(cart){
        let tempCartItems = 0;
        const totalPrice = cart.reduce((acc,curr)=>{
            tempCartItems += curr.quantity;
            return acc + curr.quantity * curr.price;
        },0);
        cartTotal.innerText =`total price : ${totalPrice.toFixed(2)} $`;
        cartItems.innerHTML = tempCartItems;
    }

    addCartItem(cartItem){
        const div = document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML = `<img src=${cartItem.imageUrl} alt="" class="cart-item-img">
        <div class="cart-item-desc">
        <h4>${cartItem.title}</h4>
        <h5>${cartItem.price}</h5>
        </div>
        <div class="cart-item-conteoller">
        <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
        <p>${cartItem.quantity}</p>
        <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
        </div> <i class="fa fa-trash-can" data-id=${cartItem.id}></i>`;
        cartContent.appendChild(div);
    }

    setupApp(){
        cart = Storage.getCart();
        cart.forEach((cartItems)=>{
            this.addCartItem(cartItems);
        });
        this.setCartValue(cart);
    }

    cartLogic(){
        // clear cart
        clearCart.addEventListener('click',()=> this.clearCart());
        // cart functionality
        cartContent.addEventListener('click',(event)=>{
            if(event.target.classList.contains('fa-chevron-up')){
                // console.log(event.target.dataset.id)
                const addQuantity = event.target;
            
                //1. get item from cart
                const addedItem = cart.find(
                    (cItem)=> cItem.id == addQuantity.dataset.id);
                    addedItem.quantity++;
                    //2. update cart value
                    this.setCartValue(cart);
                    //3. save cart
                    Storage.saveCart(cart);
                    // 4. update cart item in ui:
                    addQuantity.nextElementSibling.innerText = addedItem.quantity;
            }
            else if(event.target.classList.contains('fa-trash-can')){
                const removeItem = event.target;
                const _removeItem = cart.find(
                    (c)=> c.id == removeItem.dataset.id);
                    this.removeItem(_removeItem.id);
                    Storage.saveCart(cart);
                    cartContent.removeChild(removeItem.parentElement);
                // 1. remove from cart item

                // 2. remove
            }
            else if(event.target.classList.contains('fa-chevron-down')){
                const subQuantity = event.target;
                const substractedItem = cart.find(
                    (c)=> c.id == subQuantity.dataset.id);
                if(substractedItem.quantity === 1){
                    this.removeItem(substractedItem.id);
                    cartContent.removeChild(subQuantity.parentElement.parentElement);
                    return;
                }
                substractedItem.quantity--;
                this.setCartValue(cart);
                // save cart
                Storage.saveCart(cart);
                // update cart item in ui
                subQuantity.previousElementSibling.innerText = substractedItem.quantity;
            }
        });
    }

    clearCart(){
        cart.forEach((cItem)=> this.removeItem(cItem.id));
        // remove cart content children
        while(cartContent.children.length){
            cartContent.removeChild(cartContent.children[0]);
        }
        closeModalFunction();
    }

    removeItem(id){
        // update cart
        cart = cart.filter(cartItem => cartItem.id !== id);

        // update total price and cart items:
        this.setCartValue(cart);

        // update storage :
        Storage.saveCart(cart);

        // get add to cart buttons => update text and disable

        this.getSingleButton(id);
    }

    getSingleButton(id){
        const button = buttonsDOM.find(
            (btn) => parseInt(btn.dataset.id) === parseInt(id));
        button.innerText = `add to cart`;
        button.disabled = false;
    }
}


// 3. storage

class Storage{
    static saveProducts(products){
        localStorage.setItem('products',JSON.stringify(products));
    }
    static getProduct(id){
        const _products = JSON.parse(localStorage.getItem('products'));
        return _products.find((p)=> p.id === parseInt(id));
    }
    static saveCart(cart){
        localStorage.setItem('cart',JSON.stringify(cart));
    }
    static getCart(){
        return JSON.parse(localStorage.getItem('cart')) 
        ?  JSON.parse(localStorage.getItem('cart')) : [];
    }

}




document.addEventListener('DOMContentLoaded',()=>{
    const products = new Products();
    const productsData = products.getProduct();
    // console.log(productsData);
    const ui = new UI();
    ui.setupApp();
    ui.displayProducts(productsData);
    ui.getAddToCartBtn();
    ui.cartLogic()
    Storage.saveProducts(productsData);
})



// functions

function showModalFunction(){
    backDrop1.style.display = 'block';
    cartModal.style.opacity = '1';
    cartModal.style.top = '200px';
}

function closeModalFunction(){
    backDrop1.style.display = 'none';
    cartModal.style.opacity = '0';
    cartModal.style.top = '-100px';
}



// add events

cartBtn.addEventListener('click',showModalFunction);
closeModal.addEventListener('click',closeModalFunction);
backDrop1.addEventListener('click',closeModalFunction);


