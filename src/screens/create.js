import React from 'react'
import Breadcrumb from '../components/breadcrumb/Breadcrumb'
import CreateForm from '../components/createform/CreateForm'


const Create = () => {
    return (
        <>
            <Breadcrumb name="Create" />
            <div className="starparalax create">
                <div id="stars"></div>
                <div id="stars2"></div>
                <div id="stars3"></div>
                <p style={{textAlign: 'center', 'color':'white'}}>After creation, it takes up to a few minutes minutes for the server to recognize it.</p>
                <div id="title">
                    <div className="container">
                        <div className="row">
                            <div className="col-md-offset-3 col-md-6">
                                <div className="create-form-container">
                                    <CreateForm />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Create
