import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';

class CreateItem extends Component {
    state = {
        title: '',
        description: '',
        image: '',
        largeImage: '',
        price: 0
    };

    handleChange = (e) => {
        const { name, type, value } = e.target;
        const val = type === 'number' ? parseFloat(value) : value;
        this.setState({ [name]: val })
    }

    render() {
        return (
            <Form onSubmit={(e) => {
                e.preventDefault();

                
                }
            }>
                <fieldset>
                    <label htmlFor="title">
                        title
                        <input
                            type="text"
                            id="title"
                            name="title"
                            placeholder="Title" 
                            required
                            value={this.state.title}
                            onChange={this.handleChange}
                        />
                    </label>

                    <label htmlFor="price">
                        price
                        <input
                            type="number"
                            id="price"
                            name="price"
                            placeholder="Price" 
                            required
                            value={this.state.price}
                            onChange={this.handleChange}
                        />
                    </label>

                    <label htmlFor="description">
                        Description
                        <textarea
                            type="number"
                            id="description"
                            name="description"
                            placeholder="Enter a Description" 
                            required
                            value={this.state.description}
                            onChange={this.handleChange}
                        />
                    </label>
                    <button type="submit">Submit</button>
                </fieldset>
            </Form>
        );
    }
}

export default CreateItem;