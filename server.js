
// This file is the main entry point for the server. It will handle all requests and responses.

// import express from 'express'
const express = require('express')

const app = express()

// const hostname = '127.0.0.1';
const port = 3000;

app.use(express.json())

const setup_user_dir = require('./APIs/common/backend_json').setup_user_dir
const register_login = require('./APIs/authentication/login').register_login
const register_retrieve_list = require('./APIs/list/register_retrieve_list').register_retrieve_list
const register_retrieve_list_names = require('./APIs/list/register_retrieve_list_names').register_retrieve_list_names
const register_add_item_to_list = require('./APIs/list/register_add_to_list').register_add_item_to_list
const register_create_new_list = require('./APIs/list/register_create_new_list').register_create_new_list
const register_find_items_for_user = require('./APIs/list/register_find_items_for_user').register_find_items_for_user
const register_delete_entry = require('./APIs/list/register_delete_entry').register_delete_entry
const register_update_list_entry_values = require('./APIs/list/register_update_list_entry_values').register_update_list_entry_values
const register_return_remaining_lists_after_removal_of_list_name = require('./APIs/list/register_return_remaining_lists_after_removal_of_list_name').register_return_remaining_lists_after_removal_of_list_name
const register_jwt_life_cycle_maintainer = require('./APIs/authentication/jwt_life_cycle_maintainer').register_jwt_life_cycle_maintainer

register_login(app)
register_retrieve_list(app)
register_retrieve_list_names(app)
register_add_item_to_list(app)
register_create_new_list(app)
register_find_items_for_user(app)
register_delete_entry(app)
register_update_list_entry_values(app)
register_return_remaining_lists_after_removal_of_list_name(app)
register_jwt_life_cycle_maintainer(app)

if (process.env.NODE_ENV !== 'test') {
    setup_user_dir()
    const listener = app.listen(port, () => {
        console.log("App listening on port: " + listener.address().port);
    });
}

module.exports = { app }