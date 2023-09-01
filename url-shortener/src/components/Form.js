import React from "react";
import { nanoid } from 'nanoid'
import { getDatabase, child, ref, set, get } from "firebase/database";
import { isWebUri } from 'valid-url';
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";

// Define the Form component
class Form extends React.Component {

    // Initialize state and bind methods in the constructor
    constructor(props) {
        super(props);
        this.state = {
            longURL: '', // The original URL to be shortened
            preferedAlias: '', // The user's preferred alias for the shortened URL
            generatedURL: '', // The resulting shortened URL
            loading: false, // A flag to indicate whether a request is in progress
            errors: [], // An array to hold any validation errors
            errorMessage: {}, // An object to hold error messages for display
            toolTipMessage: 'Copy To Clip Board' // Tooltip message for the copy button
        };
    }

    // Method to handle form submission
    onSubmit = async (event) => {
        event.preventDefault(); // Prevents the page from reloading when submit is clicked

        this.setState({
            loading: true, // Set loading flag to true while processing
            generatedURL: '' // Clear any previously generated URL
        })

        // Validate the input the user has submitted
        var isFormValid = await this.validateInput()
        if (!isFormValid) {
            return // If validation fails, exit the method
        }

        // If the user has input a preferred alias then we use it, if not, we generate one
        var generatedKey = nanoid(5); // Generate a random key using nanoid
        var generatedURL = "minilinkit.com/" + generatedKey // Construct the shortened URL

        if (this.state.preferedAlias !== '') {
            generatedKey = this.state.preferedAlias // Use the user's preferred alias as the key
            generatedURL = "minilinkit.com/" + this.state.preferedAlias // Construct the shortened URL using the preferred alias
        }

        const db = getDatabase(); // Get a reference to the Firebase database

        set(ref(db, '/' + generatedKey), { // Write data to Firebase under the generated key

            generatedKey: generatedKey,
            longURL: this.state.longURL,
            preferedAlias: this.state.preferedAlias,
            generatedURL: generatedURL

        }).then((result) => {
            this.setState({
                generatedURL: generatedURL, // Update state with the new shortened URL
                loading: false // Set loading flag to false after processing is complete
            })
        }).catch((e) => {

        })
    };

    // Method to check if a field has an error
    hasError = (key) => {
        return this.state.errors.indexOf(key) !== -1; // Check if the key exists in the errors array
    }

    // Method to handle changes in form fields
    handleChange = (e) => {
        const { id, value } = e.target 
        this.setState(prevState => ({
            ...prevState,
            [id]: value  // Update state with the new value of the field that was changed
        }))
    }

    validateInput = async () => {
        var errors = [];
        var errorMessages = this.state.errorMessage

        if (this.state.longURL.length === 0) {
            errors.push("longURL");
            errorMessages['longURL'] = 'Please enter your URL!';
        } else if (!isWebUri(this.state.longURL)) {
            errors.push("longURL");
            errorMessages['longURL'] = 'Please a URL in the form of https://www....';
        }

        if (this.state.preferedAlias !== '') {
            if (this.state.preferedAlias.length > 7) {
                errors.push("suggestedAlias");
                errorMessages['suggestedAlias'] = 'Please Enter an Alias less than 7 Characters';
            } else if (this.state.preferedAlias.indexOf(' ') >= 0) {
                errors.push("suggestedAlias");
                errorMessages['suggestedAlias'] = 'Spaces are not allowed in URLS';
            }

            var keyExists = await this.checkKeyExists()

            if (keyExists.exists()) {
                errors.push("suggestedAlias");
                errorMessages['suggestedAlias'] = 'The Alias you have entered already exists! Please enter another one =-)';
            }
        }

        this.setState({
            errors: errors,
            errorMessages: errorMessages,
            loading: false
        });

        if (errors.length > 0) {
            return false;
        }

        return true;
    }


    checkKeyExists = async () => {
        const dbRef = ref(getDatabase());
        return get(child(dbRef, `/${this.state.preferedAlias}`)).catch((error) => {
            return false
        });
    }
// Method to copy the generated URL to the clipboard
copyToClipBoard = () => {
    navigator.clipboard.writeText(this.state.generatedURL) // Write the generated URL to the clipboard
    this.setState({
        toolTipMessage: 'Copied!' // Update the tooltip message to indicate success
    })
}

// Method to render the component
render() {
    return (
        <div className="container">
            <form autoComplete="off">
                <h3>Mini Link It!</h3>

                <div className="form-group">
                    <label>Enter Your Long URL</label>
                    <input
                        id="longURL"
                        onChange={this.handleChange} // Call handleChange method when the input changes
                        value={this.state.longURL} // The current value of the longURL state
                        type="url"
                        required
                        className={
                            this.hasError("longURL") // Add 'is-invalid' class if there's an error with longURL
                                ? "form-control is-invalid"
                                : "form-control"
                        }
                        placeholder="https://www..."
                    />
                </div>
                <div
                    className={
                        this.hasError("longURL") ? "text-danger" : "visually-hidden" // Show error message if there's an error with longURL
                    }
                >
                    {this.state.errorMessage.longURL}
                </div>

                <div className="form-group">
                    <label htmlFor="basic-url">Your Mini URL</label>
                    <div className="input-group mb-3">
                        <div className="input-group-prepend">
                            <span className="input-group-text">minilinkit.com/</span>
                        </div>
                        <input
                            id="preferedAlias"
                            onChange={this.handleChange} // Call handleChange method when the input changes
                            value={this.state.preferedAlias} // The current value of the preferedAlias state
                            className={
                                this.hasError("preferedAlias") // Add 'is-invalid' class if there's an error with preferedAlias
                                    ? "form-control is-invalid"
                                    : "form-control"
                            }
                            type="text" placeholder="eg. 3fwias (Optional)"
                        />
                    </div>
                    <div
                        className={
                            this.hasError("suggestedAlias") ? "text-danger" : "visually-hidden" // Show error message if there's an error with suggestedAlias
                        }
                    >
                        {this.state.errorMessage.suggestedAlias}
                    </div>
                </div>


                <button className="btn btn-primary" type="button" onClick={this.onSubmit}>
                    {
                        this.state.loading ?
                            <div>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> // Show a spinner while loading
                            </div> :
                            <div>
                                <span className="visually-hidden spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                <span>Mini Link It</span>
                            </div>
                    }

                </button>

                {
                    // Check if a shortened URL has been generated
                    this.state.generatedURL === '' ?
                        <div></div> // If not, render an empty div
                        :
                        <div className="generatedurl">
                            <span>Your generated URL is: </span>
                            <div className="input-group mb-3">
                                <input disabled type="text" value={this.state.generatedURL} className="form-control" placeholder="Recipient's username" aria-label="Recipient's username" aria-describedby="basic-addon2" />
                                    <div className="input-group-append">
                                        <OverlayTrigger
                                            key={'top'}
                                            placement={'top'}
                                            overlay={
                                                <Tooltip id={`tooltip-${'top'}`}>
                                                    {this.state.toolTipMessage}
                                                </Tooltip>
                                            }
                                        >
                                            <button onClick={() => this.copyToClipBoard()} data-toggle="tooltip" data-placement="top" title="Tooltip on top" className="btn btn-outline-secondary" type="button">Copy</button>

                                        </OverlayTrigger>

                                    </div>
                                </div>
                            </div>
                    }

                </form>
            </div>
        );
    }
}

export default Form;


