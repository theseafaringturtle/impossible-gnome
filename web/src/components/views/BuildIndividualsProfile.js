import React, {Component} from "react";
import {
  Row,
  Col,
  Form,
  FormGroup,
  Button,
  Label,
  Input,
  Alert
} from "reactstrap";
import Interest from "./Interest";
import {RingLoader} from "react-spinners";
import {getBase64} from "../../utillity/helpers";
import {handleErrors} from "../../utillity/helpers";
import '../../assets/css/view/BuildIndividualsProfile.css'

export default class BuildIndividualsProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: "",
      lastName: "",
      description: "",
      url: "",
      imageSource: "",
      interests: new Set(),
      uploadingImage: false,
      imageLoadError: null,
      showInterestsMoreInfo: false,
      pageLoaded: false
    };
  }
  componentDidMount(){
    this.props.getUser().then(user => {
      if(Object.keys(user).length === 0) {//user object is empty
        this.props.history.push("/");
        return;
      }
      this.props.setUser(user);
      let interests = new Set();
      if (user.interests) {
        user.interests.forEach(interest => {
          interests.add(interest.interestID);
        });
        this.setState({
          firstName: user.firstName,
          lastName: user.lastName,
          description: user.description,
          url: user.url,
          imageSource: user.imageSource,
          interests: interests,
          pageLoaded: true
        });
      }
    });
  }

  handleChange = e => {
    const name = e.target.name;
    const value = e.target.value;
    this.setState({
      [name]: value
    });
  };

  //to handle the selection when the button is clicked
  handleInterestSelection = evt => {
    let interestID = evt.target.value;
    let interests = new Set(this.state.interests);
    if (interests.has(interestID)) {
      interests.delete(interestID);
      this.setState({interests: interests});
    } else {
      interests.add(interestID);
      this.setState({interests: interests});
    }
  };

  handleImageSelection = e => {
    const TIME_OUT_SECOND = 6000;
    const files = e.target.files;
    getBase64(files[0]).then(res => {
      this.setState({
        uploadingImage: true
      });
      fetch(`/api/user/image`, {
        credentials: "same-origin",
        ContentType: "image/jpeg",
        method: "POST",
        body: JSON.stringify({
          imageData: res
        })
      }).then(handleErrors)
        .then(response => {
          return response.json();
        })
        .then(response => {
          this.setState({
            imageSource: response.imageSource,
            uploadingImage: false
          });
          this.props.updateUser({imageSource : response.imageSource})
        })
        .catch(err => {
          this.setState(
            {
              uploadingImage: false,
              imageLoadError: `Can't upload Image: the image size is very large or it is not of JPG/JPEG/PNG/GIF type`
            },
            () => {
              //clear the error message
              setTimeout(() => {
                this.setState({
                  imageLoadError: null
                });
              }, TIME_OUT_SECOND);
            }
          );
        });
    });
  };

  handleSubmitRequest = e => {
    fetch(`/api/user`, {
      credentials: "same-origin",
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        description: this.state.description,
        url: this.state.url
      })
    })
      .then(response => response.json())
      .then(response => {
        this.updateUserInterest(response);
      })
      .catch(err => console.error(err));
  };

  updateUserInterest = user => {
    fetch(`/api/user/interest`, {
      credentials: "same-origin",
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        interests: [...this.state.interests]
      })
    })
      .then(handleErrors)
      .then(response => {
        return response.json();
      })
      .then(response => {
        //modify the value of the current user's interests
        user.interests = response.interests;
        this.redirectOnSubmit(user);
      })
      .catch(err => console.error(err));
  };

  redirectOnSubmit = user => {
    this.props.setUser(user);
    this.props.history.push("/feed");
  };

  toggleShowInterestsMoreInfo = interestID => {
    if (!this.state.showInterestsMoreInfo) {
      this.setState(
        {
          showInterestsMoreInfo: interestID
        },
        () => {
          setTimeout(() => {
            this.setState({
              showInterestsMoreInfo: false
            });
          }, 25000);
        }
      );
    } else if (this.state.showInterestsMoreInfo !== interestID) {
      this.setState({
        showInterestsMoreInfo: interestID
      });
    } else {
      this.setState({
        showInterestsMoreInfo: false
      });
    }
  };

  isPageReady = () => {
    return this.state.pageLoaded;
  };

  render() {
    return !this.isPageReady() ? (
      <Row>
        <Col xs={4}/>
        <Col xs={4} id="interestRingLoader">
          <div className="RingLoader center-loading">
            <RingLoader
              color="#123abc"
              loading={this.state.loading}
              size={100} /*the size of the spinner*/
            />
          </div>
        </Col>
        <Col xs={4}/>
      </Row>
    ) : (
      <Row id="profile">
        <Col sm={12}>
          <Form>
            <FormGroup row id="profilePictureContainer">
              <Col sm={1}/>

              <Col sm={10}>
                <Row>
                  <Col sm={2} id="profilePicture">
                    {this.state.uploadingImage ? (
                      <RingLoader
                        id="ringLoader"
                        color="#123abc"
                        loading={this.state.loading}
                        size={60} /*the size of the spinner*/
                      />
                    ) : (
                      <img
                        id="preview"
                        src={
                          this.state.imageSource
                        }
                        alt={this.state.firstName}
                      />
                    )}
                  </Col>
                  <Col sm={10} id="uploadButton">
                    <span id="profileImageInfo">
                      Image (must be in .png, .jpg or jpeg and not bigger than
                      100px x 100px)
                    </span>
                    <Label>
                      Update Your Profile Picture
                      <input
                        type="file"
                        name="profileImage"
                        id="profileImage"
                        accept=".jpg, .jpeg, .png, .gif"
                        onChange={this.handleImageSelection}
                      />
                    </Label>
                    <br/>
                    {this.state.imageLoadError ? (
                      <Alert color="danger"> {this.state.imageLoadError}</Alert>
                    ) : (
                      ""
                    )}
                  </Col>
                </Row>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Col sm={1}/>
              <Label for="firstName" sm={10}>
                First Name
              </Label>
              <Col sm={1}/>
            </FormGroup>
            <FormGroup row>
              <Col sm={1}/>
              <Col sm={10} id="firstName">
                <Input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={this.state.firstName}
                  onChange={this.handleChange}
                />
              </Col>
              <Col sm={1}/>
            </FormGroup>
            <FormGroup row>
              <Col sm={1}/>
              <Label for="lastName" sm={10}>
                Last Name
              </Label>
              <Col sm={1}/>
            </FormGroup>
            <FormGroup row>
              <Col sm={1}/>
              <Col sm={10}>
                <Input
                  type="text"
                  name="lastName"
                  id="lastName"
                  placeholder="Last Name"
                  value={this.state.lastName}
                  onChange={this.handleChange}
                />
              </Col>
              <Col sm={1}/>
            </FormGroup>
            <FormGroup row>
              <Col sm={1}/>
              <Label for="description" sm={10}>
                A little bit about you
              </Label>
              <Col sm={1}/>
            </FormGroup>
            <FormGroup row>
              <Col sm={1}/>
              <Col sm={10}>
                <Input className="about-me-profile"
                       placeholder="What brings you here?"
                       type="textarea"
                       name="description"
                       id="description"
                       value={this.state.description}
                       onChange={this.handleChange}
                />
              </Col>
              <Col sm={1}/>
            </FormGroup>
            <FormGroup row>
              <Col sm={1}/>
              <Label for="url" sm={10}>
                Url
              </Label>
              <Col sm={1}/>
            </FormGroup>
            <FormGroup row>
              <Col sm={1}/>
              <Col sm={10}>
                <Input
                  type="url"
                  name="url"
                  id="url"
                  placeholder="Add link"
                  value={this.state.url || ""}
                  onChange={this.handleChange}
                />
              </Col>
              <Col sm={1}/>
            </FormGroup>
            <Row>
              <Col sm={1}/>
              <Col sm={10} id="interestsHeading">
                <p>
                  What opportunities would you like to hear about? (Remit)
                </p>
              </Col>
              <Col sm={1}/>
            </Row>
            <FormGroup row>
              <Col sm={12}>
                <Interest
                  setUser={this.props.setUser}
                  getUser={this.props.getUser}
                  handleInterestSelection={this.handleInterestSelection}
                  interests={this.state.interests}
                  showInterestsMoreInfo={this.state.showInterestsMoreInfo}
                  toggleShowInterestsMoreInfo={this.toggleShowInterestsMoreInfo}
                />
              </Col>
            </FormGroup>
            <Row>
              <Col sm={1}/>
              <Col sm={10}>
                <hr/>
              </Col>
              <Col sm={1}/>
            </Row>
            <Row>
              <Col sm={1}/>
              <Col sm={10}>
                <Button
                  id="doneProfileButton"
                  onClick={this.handleSubmitRequest}>
                  Done
                </Button>
              </Col>
              <Col sm={1}/>
            </Row>
          </Form>
        </Col>
      </Row>
    );
  }
}
